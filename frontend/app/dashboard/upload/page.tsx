'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, CheckCircle, AlertCircle, X } from 'lucide-react'

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [workOrderFile, setWorkOrderFile] = useState<File | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onDropInvoice = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setInvoiceFile(acceptedFiles[0])
    }
  }, [])

  const onDropWorkOrder = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setWorkOrderFile(acceptedFiles[0])
    }
  }, [])

  const onDropPhotos = useCallback((acceptedFiles: File[]) => {
    setPhotoFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const invoiceDropzone = useDropzone({
    onDrop: onDropInvoice,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 1,
  })

  const workOrderDropzone = useDropzone({
    onDrop: onDropWorkOrder,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 1,
  })

  const photoDropzone = useDropzone({
    onDrop: onDropPhotos,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 10,
  })

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invoiceFile) {
      setError('Please upload an invoice')
      return
    }

    setUploading(true)
    setError(null)
    setProgress('Uploading documents...')

    try {
      const formData = new FormData()
      formData.append('invoice', invoiceFile)
      formData.append('userId', user?.id || '')
      
      if (workOrderFile) {
        formData.append('workOrder', workOrderFile)
      }
      
      photoFiles.forEach(photo => {
        formData.append('photos', photo)
      })

      setProgress('Extracting invoice data...')
      
      const response = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Verification failed')
      }

      setProgress('Analyzing with AI...')
      
      const result = await response.json()

      setProgress('Complete!')

      // Redirect to results page
      setTimeout(() => {
        router.push(`/dashboard/invoices/${result.invoice.id}`)
      }, 1000)

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setProgress('')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Invoice</h1>
        <p className="text-gray-600 mt-2">Upload your construction invoice for AI verification</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Invoice Upload */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice (Required)
            </h2>
            
            <div
              {...invoiceDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                invoiceDropzone.isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...invoiceDropzone.getInputProps()} />
              
              {invoiceFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-6 h-6 text-success-600" />
                  <div>
                    <p className="font-medium text-gray-900">{invoiceFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(invoiceFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setInvoiceFile(null)
                    }}
                    className="ml-4 text-danger-600 hover:text-danger-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drop your invoice here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">PDF or Image (Max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Work Order Upload */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Work Order (Optional)
            </h2>
            
            <div
              {...workOrderDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                workOrderDropzone.isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...workOrderDropzone.getInputProps()} />
              
              {workOrderFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-6 h-6 text-success-600" />
                  <div>
                    <p className="font-medium text-gray-900">{workOrderFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(workOrderFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setWorkOrderFile(null)
                    }}
                    className="ml-4 text-danger-600 hover:text-danger-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Upload work order for better verification
                  </p>
                  <p className="text-sm text-gray-500">PDF or Image (Max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Photos Upload */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Job Site Photos (Optional)
            </h2>
            
            <div
              {...photoDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4 ${
                photoDropzone.isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...photoDropzone.getInputProps()} />
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drop photos here, or click to browse
              </p>
              <p className="text-sm text-gray-500">Up to 10 images (JPG, PNG)</p>
            </div>

            {photoFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photoFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-danger-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="card bg-danger-50 border-danger-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger-600">{error}</p>
              </div>
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="card bg-primary-50 border-primary-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <p className="text-sm text-primary-700 font-medium">{progress}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading || !invoiceFile}
              className="btn-primary flex-1"
            >
              {uploading ? 'Verifying...' : 'Verify Invoice'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
