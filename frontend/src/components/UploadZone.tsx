'use client'

import { useState, useRef } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UploadZone({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      await action(formData)
      setFile(null) // Reset on success
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="relative z-10 flex flex-col w-full">
      <div 
        className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl transition-all duration-300 ease-out overflow-hidden
          ${!file ? 'min-h-[280px]' : 'min-h-[140px]'}
          ${dragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <input 
              ref={inputRef}
              type="file" 
              name="file" 
              accept="application/pdf"
              required 
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none p-6 text-center">
              <div className={`p-4 rounded-full mb-5 shadow-sm transition-transform duration-500 ${dragActive ? 'bg-primary/20 scale-125' : 'bg-background group-hover:scale-110'}`}>
                <UploadCloud className={`w-8 h-8 ${dragActive ? 'text-primary' : 'text-foreground'}`} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Upload your document</h3>
              <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                Drag and drop your PDF here, or click to browse. We'll automatically extract the zoning rules.
              </p>
              <div className="px-6 py-2.5 rounded-full bg-background border border-border text-sm font-medium shadow-sm">
                Select a file
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-6">
            <div className="flex items-center gap-4 p-4 pr-6 bg-card shadow-sm border border-border rounded-2xl max-w-md w-full relative z-50">
              <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                type="button" 
                onClick={handleRemove}
                disabled={isSubmitting}
                className="p-2 shrink-0 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <input 
              type="file" 
              name="file" 
              className="hidden" 
              ref={(input) => {
                if (input && file) {
                  const dataTransfer = new DataTransfer()
                  dataTransfer.items.add(file)
                  input.files = dataTransfer.files
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button 
          type="submit" 
          size="lg" 
          disabled={!file || isSubmitting}
          className={`rounded-full px-8 h-12 transition-all duration-300 ${(!file || isSubmitting) ? 'opacity-50 grayscale' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
        >
          {isSubmitting ? 'Uploading...' : file ? 'Process Document' : 'Select a document first'}
        </Button>
      </div>
    </form>
  )
}
