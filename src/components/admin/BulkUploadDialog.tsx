import { useRef, useState } from 'react'
import {
  UploadCloud,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from '@/hooks/use-toast'

interface BulkUploadDialogProps {
  readonly open: boolean
  readonly onClose: () => void
  /** Title shown in the dialog header, e.g. "Datasets" */
  readonly title: string
  /** API path to GET the CSV template, e.g. "/datasets/bulk-upload/template" */
  readonly templateEndpoint: string
  /** API path to POST the CSV file, e.g. "/datasets/bulk-upload" */
  readonly uploadEndpoint: string
  /**
   * React Query key prefix to invalidate on success.
   * e.g. ["admin", "datasets"]
   */
  readonly invalidateKeys: string[]
  /** File name for the downloaded template. Defaults to "<title>-template.csv" */
  readonly templateFilename?: string
  /** Called after a successful upload (after invalidation) */
  readonly onSuccess?: () => void
}

export function BulkUploadDialog({
  open,
  onClose,
  title,
  templateEndpoint,
  uploadEndpoint,
  invalidateKeys,
  templateFilename,
  onSuccess,
}: BulkUploadDialogProps) {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloadingTpl, setDownloadingTpl] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  function reset() {
    setFile(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClose() {
    if (uploading) return
    reset()
    onClose()
  }

  async function downloadTemplate() {
    setDownloadingTpl(true)
    try {
      const res = await api.get<string>(templateEndpoint, {
        responseType: 'text',
      })
      const csvText =
        typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download =
        templateFilename ??
        `${title.toLowerCase().replace(/\s+/g, '-')}-template.csv`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to download template.',
        variant: 'destructive',
      })
    } finally {
      setDownloadingTpl(false)
    }
  }

  function onFileSelect(selected: File | null) {
    if (!selected) return
    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setResult({ type: 'error', message: 'Only CSV files are accepted.' })
      return
    }
    setFile(selected)
    setResult(null)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await api.post(uploadEndpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      qc.invalidateQueries({ queryKey: invalidateKeys })
      setResult({
        type: 'success',
        message: 'File uploaded and processed successfully!',
      })
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      toast({ title: 'Bulk upload complete' })
      onSuccess?.()
    } catch (e: unknown) {
      const axiosErr = e as {
        response?: { data?: { message?: string | string[] } }
        message?: string
      }
      const raw =
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        'Upload failed. Please check the file format and try again.'
      const msg = Array.isArray(raw) ? raw.join('; ') : String(raw)
      setResult({ type: 'error', message: msg })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={`Bulk Upload — ${title}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Template download strip */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Step 1 — Download Template
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Use the CSV template to see the required columns and data format.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg gap-1.5 shrink-0"
            onClick={downloadTemplate}
            disabled={downloadingTpl}
          >
            {downloadingTpl ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Template CSV
          </Button>
        </div>

        {/* Drop zone */}
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">
            Step 2 — Upload your completed CSV file
          </p>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: interactive element */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload CSV file"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              onFileSelect(e.dataTransfer.files[0] ?? null)
            }}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer select-none ${
              dragging
                ? 'border-[#D52B1E] bg-red-50'
                : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <>
                <FileText className="h-10 w-10 text-green-500" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    reset()
                  }}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 text-gray-400"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-gray-300" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600">
                    Drag & drop or click to choose file
                  </p>
                  <p className="text-xs text-gray-400">CSV files only</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Result banner */}
        {result && (
          <div
            className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm border ${
              result.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {result.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
            )}
            <span>{result.message}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5"
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UploadCloud className="h-3.5 w-3.5" />
            )}
            {uploading ? 'Uploading…' : 'Upload CSV'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
