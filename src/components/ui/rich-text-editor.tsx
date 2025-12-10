import { useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  Link,
  List,
  BlockQuote,
  CodeBlock,
  Code,
  Image,
  ImageInsert,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageResize,
  ImageUpload,
  Base64UploadAdapter,
  MediaEmbed,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  Alignment,
  Font,
  Highlight,
  HorizontalLine,
  Indent,
  IndentBlock,
  Undo,
  SourceEditing,
  GeneralHtmlSupport,
  HtmlEmbed,
  FindAndReplace,
  SelectAll,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersEssentials,
  AutoLink,
  Mention,
  WordCount,
  type EditorConfig
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your content here...',
  minHeight = '400px',
  disabled = false,
  error = false,
  id = 'rich-text-editor'
}: RichTextEditorProps) {
  const editorRef = useRef<ClassicEditor | null>(null);

  const editorConfig: EditorConfig = useMemo(() => ({
    licenseKey: 'GPL',
    plugins: [
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Heading,
      Link,
      List,
      BlockQuote,
      CodeBlock,
      Code,
      Image,
      ImageInsert,
      ImageCaption,
      ImageStyle,
      ImageToolbar,
      ImageResize,
      ImageUpload,
      Base64UploadAdapter,
      MediaEmbed,
      Table,
      TableToolbar,
      TableProperties,
      TableCellProperties,
      Alignment,
      Font,
      Highlight,
      HorizontalLine,
      Indent,
      IndentBlock,
      Undo,
      SourceEditing,
      GeneralHtmlSupport,
      HtmlEmbed,
      FindAndReplace,
      SelectAll,
      RemoveFormat,
      SpecialCharacters,
      SpecialCharactersEssentials,
      AutoLink,
      Mention,
      WordCount
    ],
    toolbar: {
      items: [
        'undo', 'redo',
        '|',
        'heading',
        '|',
        'bold', 'italic', 'underline', 'strikethrough',
        '|',
        'link', 'insertImage', 'insertTable', 'mediaEmbed',
        '|',
        'bulletedList', 'numberedList',
        '|',
        'blockQuote', 'codeBlock',
        '|',
        'alignment', 'outdent', 'indent',
        '|',
        'sourceEditing'
      ],
      shouldNotGroupWhenFull: true
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
      ]
    },
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'resizeImage'
      ],
      resizeOptions: [
        { name: 'resizeImage:original', value: null, label: 'Original' },
        { name: 'resizeImage:25', value: '25', label: '25%' },
        { name: 'resizeImage:50', value: '50', label: '50%' },
        { name: 'resizeImage:75', value: '75', label: '75%' }
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells',
        'tableProperties', 'tableCellProperties'
      ]
    },
    link: {
      decorators: {
        openInNewTab: {
          mode: 'manual',
          label: 'Open in a new tab',
          attributes: {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }
      }
    },
    fontSize: {
      options: [10, 12, 14, 'default', 18, 20, 24, 28, 32]
    },
    placeholder: placeholder,
    htmlSupport: {
      allow: [
        { name: /.*/, attributes: true, classes: true, styles: true }
      ]
    }
  }), [placeholder]);

  return (
    <div 
      id={id}
      className={`
        ckeditor-wrapper rounded-lg overflow-hidden
        ${error ? 'ring-2 ring-red-500 ring-offset-1' : 'border border-border'}
        ${disabled ? 'opacity-60 pointer-events-none' : ''}
      `}
      style={{ minHeight }}
    >
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value}
        disabled={disabled}
        onReady={(editor) => {
          editorRef.current = editor;
          // Set min height for editable area
          const editable = editor.ui.view.editable.element;
          if (editable) {
            editable.style.minHeight = minHeight;
          }
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
      <style>{`
        .ckeditor-wrapper .ck.ck-editor {
          --ck-border-radius: 0.5rem;
          --ck-color-base-background: hsl(var(--background));
          --ck-color-base-foreground: hsl(var(--card));
          --ck-color-base-border: hsl(var(--border));
          --ck-color-toolbar-background: hsl(var(--secondary));
          --ck-color-toolbar-border: hsl(var(--border));
          --ck-color-button-default-hover-background: hsl(var(--accent));
          --ck-color-button-on-background: hsl(var(--accent));
          --ck-color-text: hsl(var(--foreground));
          --ck-color-panel-background: hsl(var(--popover));
          --ck-color-panel-border: hsl(var(--border));
          --ck-color-dropdown-panel-background: hsl(var(--popover));
          --ck-color-input-background: hsl(var(--background));
          --ck-color-input-border: hsl(var(--border));
          --ck-color-input-text: hsl(var(--foreground));
          --ck-focus-ring: 2px solid hsl(var(--ring));
          font-family: inherit;
        }
        
        .ckeditor-wrapper .ck.ck-editor__main {
          background: hsl(var(--background) / 0.5);
        }
        
        .ckeditor-wrapper .ck.ck-content {
          font-size: 1rem;
          line-height: 1.75;
          padding: 1.25rem;
        }
        
        .ckeditor-wrapper .ck.ck-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .ckeditor-wrapper .ck.ck-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .ckeditor-wrapper .ck.ck-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .ckeditor-wrapper .ck.ck-content p {
          margin-bottom: 0.75rem;
        }
        
        .ckeditor-wrapper .ck.ck-content blockquote {
          border-left: 4px solid hsl(var(--accent));
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        .ckeditor-wrapper .ck.ck-content pre {
          background: hsl(var(--secondary));
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
        }
        
        .ckeditor-wrapper .ck.ck-content code {
          background: hsl(var(--secondary));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        
        .ckeditor-wrapper .ck.ck-content pre code {
          background: transparent;
          padding: 0;
        }
        
        .ckeditor-wrapper .ck.ck-content a {
          color: hsl(var(--accent));
          text-decoration: underline;
        }
        
        .ckeditor-wrapper .ck.ck-content a:hover {
          opacity: 0.8;
        }
        
        .ckeditor-wrapper .ck.ck-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        
        .ckeditor-wrapper .ck.ck-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        
        .ckeditor-wrapper .ck.ck-content th,
        .ckeditor-wrapper .ck.ck-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.75rem;
        }
        
        .ckeditor-wrapper .ck.ck-content th {
          background: hsl(var(--secondary));
          font-weight: 600;
        }
        
        .ckeditor-wrapper .ck.ck-toolbar {
          border-bottom: 1px solid hsl(var(--border)) !important;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0.5rem;
        }
        
        .ckeditor-wrapper .ck.ck-button {
          border-radius: 0.375rem;
        }
        
        .ckeditor-wrapper .ck.ck-button:hover {
          background: hsl(var(--accent)) !important;
        }
        
        .ckeditor-wrapper .ck.ck-button.ck-on {
          background: hsl(var(--accent)) !important;
          color: hsl(var(--accent-foreground)) !important;
        }
        
        /* Word count at bottom */
        .ckeditor-wrapper .ck.ck-word-count {
          display: flex;
          justify-content: flex-end;
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          color: hsl(var(--muted-foreground));
          background: hsl(var(--secondary) / 0.5);
          border-top: 1px solid hsl(var(--border));
        }
        
        /* Dark mode adjustments */
        .dark .ckeditor-wrapper .ck.ck-editor {
          --ck-color-base-background: hsl(var(--background));
          --ck-color-base-foreground: hsl(var(--card));
        }
        
        /* Focus styles */
        .ckeditor-wrapper .ck.ck-editor__editable:focus {
          outline: none;
          box-shadow: none;
        }
        
        .ckeditor-wrapper:focus-within {
          ring: 2px solid hsl(var(--ring));
          ring-offset: 2px;
        }
      `}</style>
    </div>
  );
}
