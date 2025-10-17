import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const invoiceFile = formData.get('invoice') as File
    const workOrderFile = formData.get('workOrder') as File | null
    const photoFiles = formData.getAll('photos') as File[]
    const userId = formData.get('userId') as string

    if (!invoiceFile || !userId) {
      return NextResponse.json(
        { error: 'Invoice file and user ID are required' },
        { status: 400 }
      )
    }

    // Convert files to base64
    const invoiceBase64 = await fileToBase64(invoiceFile)
    const workOrderBase64 = workOrderFile ? await fileToBase64(workOrderFile) : null
    const photoBase64s = await Promise.all(photoFiles.map(f => fileToBase64(f)))

    // Step 1: Extract invoice data
    console.log('Extracting invoice data...')
    const invoiceData = await aiService.extractInvoiceData(invoiceBase64)

    // Step 2: Extract work order data (if provided)
    let workOrderData = null
    if (workOrderBase64) {
      console.log('Extracting work order data...')
      workOrderData = await aiService.extractWorkOrderData(workOrderBase64)
    }

    // Step 3: Analyze photos (if provided)
    let photoAnalysis = null
    if (photoBase64s.length > 0) {
      console.log('Analyzing photos...')
      photoAnalysis = await aiService.analyzePhotos(photoBase64s)
    }

    // Step 4: Verify invoice
    console.log('Running AI verification...')
    const verification = await aiService.verifyInvoice(
      invoiceData,
      workOrderData || {
        workOrderNumber: 'N/A',
        crew: [],
        hoursPerCrew: [],
        equipment: [],
        workDescription: '',
        date: invoiceData.date
      },
      photoAnalysis || {
        workCompleted: false,
        crewVisible: 0,
        equipmentConfirmed: false,
        estimatedWorkHours: 'Unknown',
        workScope: 'No photos provided',
        confidence: 0
      }
    )

    // Step 5: Save to database
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        invoice_number: invoiceData.invoiceNumber,
        contractor_name: invoiceData.contractor,
        total_amount: invoiceData.total,
        claimed_hours: invoiceData.lineItems[0]?.quantity || 0,
        invoice_date: invoiceData.date,
        due_date: invoiceData.dueDate,
        status: verification.status,
        ai_confidence: verification.confidence,
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Database error:', invoiceError)
      return NextResponse.json(
        { error: 'Failed to save invoice' },
        { status: 500 }
      )
    }

    // Save analysis
    await supabase.from('invoice_analyses').insert({
      invoice_id: invoice.id,
      findings: verification.findings,
      flags: verification.flags,
      recommendations: verification.recommendations,
      confidence_score: verification.confidence,
    })

    // Upload files to storage
    const timestamp = Date.now()
    
    const { data: invoiceUpload } = await supabase.storage
      .from('invoices')
      .upload(`${userId}/${timestamp}-invoice.pdf`, invoiceFile)

    if (invoiceUpload) {
      await supabase.from('documents').insert({
        invoice_id: invoice.id,
        file_name: invoiceFile.name,
        file_type: 'invoice',
        file_url: invoiceUpload.path,
        file_size: invoiceFile.size,
      })
    }

    // Upload work order if provided
    if (workOrderFile) {
      const { data: workOrderUpload } = await supabase.storage
        .from('invoices')
        .upload(`${userId}/${timestamp}-workorder.pdf`, workOrderFile)

      if (workOrderUpload) {
        await supabase.from('documents').insert({
          invoice_id: invoice.id,
          file_name: workOrderFile.name,
          file_type: 'work_order',
          file_url: workOrderUpload.path,
          file_size: workOrderFile.size,
        })
      }
    }

    // Upload photos
    for (let i = 0; i < photoFiles.length; i++) {
      const photo = photoFiles[i]
      const { data: photoUpload } = await supabase.storage
        .from('invoices')
        .upload(`${userId}/${timestamp}-photo-${i}.jpg`, photo)

      if (photoUpload) {
        await supabase.from('documents').insert({
          invoice_id: invoice.id,
          file_name: photo.name,
          file_type: 'photo',
          file_url: photoUpload.path,
          file_size: photo.size,
        })
      }
    }

    return NextResponse.json({
      success: true,
      invoice,
      verification,
    })

  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  return buffer.toString('base64')
}
