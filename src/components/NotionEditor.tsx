'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useCallback, useState, useRef } from 'react';
import { savePageContent } from '@/core/usecases/pageUsecases';
import { Quote, ListOrdered, List, CheckSquare, Table2, Heading1, Heading2, Heading3 } from 'lucide-react';

export default function NotionEditor({ initialContent, route }: { initialContent: string, route: string }) {
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent || '<p>Comienza a escribir o presiona / para comandos...</p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save logic
      debouncedSave(editor.getHTML());
    },
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((html: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      await savePageContent(route, html);
      setIsSaving(false);
    }, 1000);
  }, [route]);

  if (!editor) {
    return null;
  }

  return (
    <div className="notion-editor-wrapper" style={{ marginTop: '2rem' }}>
      
      {/* Sticky Toolbar */}
      <div className="editor-toolbar glass-panel" style={{ 
        display: 'flex', gap: '8px', padding: '8px', marginBottom: '1rem', 
        position: 'sticky', top: '20px', zIndex: 100,
        overflowX: 'auto', flexWrap: 'nowrap' 
      }}>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`icon-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`} title="Heading 1"><Heading1 size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`icon-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`} title="Heading 2"><Heading2 size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`icon-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`} title="Bullet List"><List size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`icon-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`} title="Numbered List"><ListOrdered size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`icon-btn ${editor.isActive('taskList') ? 'is-active' : ''}`} title="To-do List"><CheckSquare size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`icon-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`} title="Quote"><Quote size={18} /></button>
        <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 8px' }}></div>
        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="icon-btn" title="Insert Table"><Table2 size={18} /></button>
        
        {/* Status Indicator */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {isSaving ? 'Guardando...' : 'Guardado'}
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} style={{ minHeight: '300px' }} />
    </div>
  );
}
