import { useRef } from 'react'
import { ImageIcon, FileText, X, Loader2 } from 'lucide-react'
import { useUploadFile } from '@/hooks/useAdmin'

interface ImageUploadProps {
  readonly value: string
  readonly onChange: (url: string) => void
  readonly id?: string
  readonly previewHeight?: string
  /** 'image' (default) shows an image preview; 'document' shows a filename + link preview */
  readonly mode?: 'image' | 'document'
  /** Override the accepted MIME/extension list */
  readonly accept?: string
  /** Override the upload button label */
  readonly label?: string
}

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.csv,.xlsx,.xls'

export function ImageUpload({
  value,
  onChange,
  id,
  previewHeight = 'h-36',
  mode = 'image',
  accept,
  label,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadFile()

  const resolvedAccept = accept ?? (mode === 'document' ? DOCUMENT_ACCEPT : IMAGE_ACCEPT)
  const uploadLabel = label ?? (mode === 'document' ? 'Click to upload document' : 'Click to upload image')
  const uploadHint = mode === 'document' ? 'PDF, DOC, CSV, XLSX' : 'PNG, JPG, WEBP'
  const fileName = value ? decodeURIComponent(value.split('/').pop()?.split('?')[0] ?? 'file') : ''

  return (
    <div>
      {value ? (
        mode === 'document' ? (
          <div className="relative flex items-center gap-3 rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5">
            <FileText className="h-7 w-7 text-[#D52B1E] shrink-0" />
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm font-medium text-slate-700 hover:text-[#D52B1E] truncate"
            >
              {fileName}
            </a>
            <button
              type="button"
              onClick={() => onChange('')}
              className="ml-auto text-slate-400 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className={`relative rounded-lg overflow-hidden border border-gray-200 bg-slate-50 ${previewHeight}`}>
            <img src={value} alt="Cover preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow text-slate-500 hover:text-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-[#D52B1E] hover:text-[#D52B1E] transition-colors disabled:opacity-50 bg-white"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {mode === 'document' ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
              <span className="text-xs font-medium">{uploadLabel}</span>
              <span className="text-[10px]">{uploadHint}</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={resolvedAccept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          uploadMutation.mutate(file, { onSuccess: (url) => onChange(url) })
          e.target.value = ''
        }}
      />
    </div>
  )
}
