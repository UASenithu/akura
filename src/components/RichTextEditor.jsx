'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { 
  Bold, Italic, Strikethrough, 
  List, ListOrdered, Quote, 
  Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Heading1, Heading2
} from 'lucide-react'

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-2'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline'
        }
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none'
      }
    }
  })

  if (!editor) return null

  const addImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = prompt('Enter link URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const ToolbarButton = ({ onClick, icon: Icon, isActive, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition ${
        isActive 
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-600">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          icon={Bold} 
          isActive={editor.isActive('bold')} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          icon={Italic} 
          isActive={editor.isActive('italic')} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          icon={Strikethrough} 
          isActive={editor.isActive('strike')} 
        />
        <div className="w-px h-8 bg-gray-300 dark:bg-slate-600 mx-1" />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          icon={Heading1} 
          isActive={editor.isActive('heading', { level: 1 })} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          icon={Heading2} 
          isActive={editor.isActive('heading', { level: 2 })} 
        />
        <div className="w-px h-8 bg-gray-300 dark:bg-slate-600 mx-1" />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          icon={List} 
          isActive={editor.isActive('bulletList')} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          icon={ListOrdered} 
          isActive={editor.isActive('orderedList')} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          icon={Quote} 
          isActive={editor.isActive('blockquote')} 
        />
        <div className="w-px h-8 bg-gray-300 dark:bg-slate-600 mx-1" />
        <ToolbarButton onClick={addLink} icon={LinkIcon} />
        <ToolbarButton onClick={addImage} icon={ImageIcon} />
        <div className="w-px h-8 bg-gray-300 dark:bg-slate-600 mx-1" />
        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()} 
          icon={Undo} 
          disabled={!editor.can().undo()}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().redo().run()} 
          icon={Redo} 
          disabled={!editor.can().redo()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}