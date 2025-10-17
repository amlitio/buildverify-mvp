import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface InvoiceData {
  invoiceNumber: string
  contractor: string
  date: string
  dueDate: string
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  subtotal: number
  tax: number
  total: number
}

export interface WorkOrderData {
  workOrderNumber: string
  crew: string[]
  hoursPerCrew: number[]
  equipment: string[]
  workDescription: string
  date: string
}

export interface PhotoAnalysis {
  workCompleted: boolean
  crewVisible: number
  equipmentConfirmed: boolean
  estimatedWorkHours: string
  workScope: string
  confidence: number
}

export interface VerificationResult {
  status: 'verified' | 'flagged' | 'disputed'
  confidence: number
  findings: {
    crewDiscrepancy?: {
      status: string
      invoiceClaims: string
      workOrderShows: string
      question: string
      potentialOvercharge?: number
    }
    mobilizationFees?: {
      status: string
      claimed: number
      question: string
      potentialOvercharge?: number
    }
    workScope?: {
      status: string
      claimedHours: number
      workDescription: string
    }
    photoVerification?: PhotoAnalysis
  }
  flags: string[]
  recommendations: string[]
}

export class AIVerificationService {
  async extractInvoiceData(base64Image: string): Promise<InvoiceData> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this construction invoice image and extract the following information in JSON format:
              {
                "invoiceNumber": "string",
                "contractor": "string",
                "date": "YYYY-MM-DD",
                "dueDate": "YYYY-MM-DD",
                "lineItems": [
                  {
                    "description": "string",
                    "quantity": number,
                    "unitPrice": number,
                    "amount": number
                  }
                ],
                "subtotal": number,
                "tax": number,
                "total": number
              }
              
              Extract exact values from the invoice. If a field is not visible, use null.
              Return ONLY valid JSON, no explanations.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    })

    const content = response.choices[0].message.content || '{}'
    return JSON.parse(content.trim())
  }

  async extractWorkOrderData(base64Image: string): Promise<WorkOrderData> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this work order and extract:
              {
                "workOrderNumber": "string",
                "crew": ["name1", "name2", ...],
                "hoursPerCrew": [hours1, hours2, ...],
                "equipment": ["equipment1", "equipment2", ...],
                "workDescription": "string",
                "date": "YYYY-MM-DD"
              }
              
              Look for crew member names, regular hours worked, equipment used.
              Return ONLY valid JSON.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.1,
    })

    const content = response.choices[0].message.content || '{}'
    return JSON.parse(content.trim())
  }

  async analyzePhotos(base64Images: string[]): Promise<PhotoAnalysis> {
    const imageContents = base64Images.map(img => ({
      type: 'image_url' as const,
      image_url: {
        url: `data:image/jpeg;base64,${img}`
      }
    }))

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze these construction job site photos and provide:
              {
                "workCompleted": boolean,
                "crewVisible": number (count visible workers),
                "equipmentConfirmed": boolean,
                "estimatedWorkHours": "X-Y hours",
                "workScope": "description of work visible",
                "confidence": number (0-100)
              }
              
              Return ONLY valid JSON.`
            },
            ...imageContents
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
    })

    const content = response.choices[0].message.content || '{}'
    return JSON.parse(content.trim())
  }

  async verifyInvoice(
    invoiceData: InvoiceData,
    workOrderData: WorkOrderData,
    photoAnalysis: PhotoAnalysis
  ): Promise<VerificationResult> {
    // Calculate total crew hours from work order
    const totalCrewHours = workOrderData.hoursPerCrew.reduce((sum, h) => sum + h, 0)
    const crewCount = workOrderData.crew.length
    const avgHoursPerCrew = totalCrewHours / crewCount

    // Extract claimed hours from invoice
    const hourlyLineItem = invoiceData.lineItems.find(item => 
      item.description.toLowerCase().includes('hour')
    )
    const claimedHours = hourlyLineItem?.quantity || 0

    const findings: VerificationResult['findings'] = {}
    const flags: string[] = []
    const recommendations: string[] = []

    // Check crew hour discrepancy
    if (claimedHours > 0 && totalCrewHours > 0) {
      if (Math.abs(claimedHours - avgHoursPerCrew) > 1) {
        findings.crewDiscrepancy = {
          status: '⚠️ WARNING',
          invoiceClaims: `${claimedHours} hours`,
          workOrderShows: `${crewCount} crew × ${avgHoursPerCrew.toFixed(1)} hours = ${totalCrewHours} total`,
          question: 'Is this per-person or total crew hours?',
          potentialOvercharge: (claimedHours * crewCount - claimedHours) * (hourlyLineItem?.unitPrice || 0)
        }
        flags.push('crew_hour_discrepancy')
        recommendations.push('Request clarification on hourly billing structure')
      }
    }

    // Check for mobilization fees
    const mobLineItem = invoiceData.lineItems.find(item =>
      item.description.toLowerCase().includes('mobilization')
    )
    if (mobLineItem && mobLineItem.quantity > 1) {
      findings.mobilizationFees = {
        status: '⚠️ REVIEW NEEDED',
        claimed: mobLineItem.amount,
        question: 'Industry standard is 1 hour total for local jobs',
        potentialOvercharge: mobLineItem.amount * 0.66
      }
      flags.push('high_mobilization_fees')
      recommendations.push('Negotiate mobilization fees')
    }

    // Verify photo evidence
    findings.photoVerification = photoAnalysis
    if (photoAnalysis.workCompleted) {
      recommendations.push('Work completion verified via photos')
    }

    // Calculate confidence score
    let confidence = 50
    if (photoAnalysis.workCompleted) confidence += 20
    if (photoAnalysis.equipmentConfirmed) confidence += 10
    if (findings.crewDiscrepancy) confidence -= 15
    if (findings.mobilizationFees) confidence -= 10
    if (photoAnalysis.confidence) confidence += (photoAnalysis.confidence - 50) * 0.3

    confidence = Math.max(0, Math.min(100, confidence))

    const status = confidence >= 85 ? 'verified' : confidence >= 70 ? 'flagged' : 'disputed'

    return {
      status,
      confidence: Math.round(confidence),
      findings,
      flags,
      recommendations
    }
  }
}

export const aiService = new AIVerificationService()
