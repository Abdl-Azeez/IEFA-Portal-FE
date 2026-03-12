import { useRef } from 'react'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import { useUploadFile } from '@/hooks/useAdmin'

interface ImageUploadProps {
  readonly value: string
  readonly onChange: (url: string) => void
  readonly id?: string
  readonly previewHeight?: string
}

export function ImageUpload({ value, onChange, id, previewHeight = 'h-36' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadFile()

  return (
    <div>
      {value ? (
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
              <ImageIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Click to upload image</span>
              <span className="text-[10px]">PNG, JPG, WEBP</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
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
