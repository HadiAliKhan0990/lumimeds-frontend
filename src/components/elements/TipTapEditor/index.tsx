'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, EditorContentProps } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './TipTapEditor.scss';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  onBlur?: EditorContentProps['onBlur'];
  name?: EditorContentProps['name'];
  variables?: readonly string[];
  showToolbar?: boolean;
  onKeyDown?: (event: KeyboardEvent) => boolean | void;
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  className = '',
  variables,
  showToolbar = true,
  onKeyDown,
  ...props
}: Readonly<TipTapEditorProps>) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // Scroll to bottom when content is updated (e.g., new line, typing at end)
      requestAnimationFrame(() => {
        const editorElement = editor.view.dom.closest('.tiptap-editor') as HTMLElement;
        if (editorElement) {
          const selection = editor.state.selection;
          const isAtEnd = selection.$to.pos >= editor.state.doc.content.size - 1;
          // Only auto-scroll if cursor is at or near the end
          if (isAtEnd) {
            editorElement.scrollTop = editorElement.scrollHeight;
          }
        }
      });
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor rich-content',
        placeholder,
      },
      handleKeyDown: (view, event) => {
        // Handle Enter key to scroll to bottom when user moves to next line
        if (event.key === 'Enter') {
          // Let TipTap handle the Enter first, then scroll
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const editorElement = view.dom.closest('.tiptap-editor') as HTMLElement;
              if (editorElement) {
                editorElement.scrollTop = editorElement.scrollHeight;
              }
            });
          });
        }

        // Call custom onKeyDown handler if provided
        if (onKeyDown) {
          const result = onKeyDown(event);
          // If onKeyDown returns false, prevent default behavior
          if (result === false) {
            return true;
          }
          // If onKeyDown returns true, let TipTap handle it
          return false;
        }
        // Otherwise, let TipTap handle it
        return false;
      },
      handlePaste: (view) => {
        // Let TipTap handle the paste first
        // Then scroll to bottom after paste is processed
        // Use double requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const editorElement = view.dom.closest('.tiptap-editor') as HTMLElement;
            if (editorElement) {
              // Scroll to bottom after content is rendered
              editorElement.scrollTop = editorElement.scrollHeight;
            }
          });
        });
        // Return false to let TipTap handle the paste normally
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const insertVariable = (variableName: string) => {
    if (!editor) return;
    const variableText = `{{${variableName}}}`;
    editor.chain().focus().insertContent(variableText).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={`tiptap-wrapper ${className}`}>
      {editable && showToolbar && (
        <div className='tiptap-toolbar'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title='Bold'
          >
            <strong>B</strong>
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title='Italic'
          >
            <em>I</em>
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            title='Strike'
          >
            <s>S</s>
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            title='Bullet List'
          >
            •
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            title='Ordered List'
          >
            1.
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title='Undo'
          >
            ↶
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title='Redo'
          >
            ↷
          </button>
          {variables && variables.length > 0 && (
            <>
              <div className='tiptap-toolbar-divider'></div>
              {variables.map((variable) => (
                <button
                  key={variable}
                  type='button'
                  onClick={() => insertVariable(variable)}
                  title={`Insert {{${variable}}}`}
                  className='tiptap-variable-btn'
                >
                  {variable}
                </button>
              ))}
            </>
          )}
        </div>
      )}
      <EditorContent editor={editor} {...props} />
    </div>
  );
}
