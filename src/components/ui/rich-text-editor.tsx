import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Heading2,
  Heading3, Link as LinkIcon, Undo, Redo, Minus,
} from 'lucide-react'

interface RichTextEditorProps {
  readonly value: string
  readonly onChange: (html: string) => void
  readonly placeholder?: string
  readonly minHeight?: string
}

function ToolbarButton({
  onClick, active, title, children,
}: Readonly<{ onClick: () => void; active?: boolean; title: string; children: React.ReactNode }>) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded text-xs transition-colors ${active ? 'bg-[#D52B1E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange, placeholder = 'Write content here…', minHeight = '180px' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
    ],
    content: value || '',
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  })

  if (!editor) return null

  function setLink() {
    const url = globalThis.window.prompt('Enter URL')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#D52B1E] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-slate-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="w-px h-4 bg-gray-200 mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="w-px h-4 bg-gray-200 mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule">
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="w-px h-4 bg-gray-200 mx-0.5" />
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link">
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="flex-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" active={false}>
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" active={false}>
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-3 py-2 text-slate-800 text-sm focus:outline-none"
        style={{ minHeight }}
      />

      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          float: left;
          height: 0;
        }
        .tiptap:focus { outline: none; }
        .tiptap h2 { font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.25rem; }
        .tiptap h3 { font-size: 0.95rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
        .tiptap ul { list-style: disc; padding-left: 1.25rem; }
        .tiptap ol { list-style: decimal; padding-left: 1.25rem; }
        .tiptap a { color: #D52B1E; text-decoration: underline; }
        .tiptap hr { border-color: #e2e8f0; margin: 0.75rem 0; }
      `}</style>
    </div>
  )
}
