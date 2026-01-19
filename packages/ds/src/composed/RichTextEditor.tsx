/**
 * RichTextEditor Component
 *
 * A rich text editor for CRUD operations with formatting toolbar.
 * Supports bold, italic, lists, headings, links, and more.
 *
 * Uses contentEditable for rich editing capabilities.
 * All styling uses design tokens.
 *
 * SSR-safe: Uses 'use client' directive.
 * 
 * @module @xala/ds/composed/RichTextEditor
 */

'use client';

import React, { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type TextFormat = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikethrough'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'paragraph'
  | 'bulletList'
  | 'numberedList'
  | 'blockquote'
  | 'code'
  | 'link'
  | 'image'
  | 'horizontalRule'
  | 'undo'
  | 'redo';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  readOnly?: boolean;
  toolbar?: TextFormat[];
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Default Toolbar
// =============================================================================

const DEFAULT_TOOLBAR: TextFormat[] = [
  'bold',
  'italic',
  'underline',
  'heading1',
  'heading2',
  'paragraph',
  'bulletList',
  'numberedList',
  'blockquote',
  'link',
  'horizontalRule',
  'undo',
  'redo',
];

// =============================================================================
// Icons
// =============================================================================

function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

function StrikethroughIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2m8.2 3.7c.3.4.4.8.4 1.3 0 2.9-2.7 3.6-6.2 3.6-2.3 0-4.4-.3-6.2-.9" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

function Heading1Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h8M4 18V6M12 18V6M17 12l3-2v8" />
    </svg>
  );
}

function Heading2Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
    </svg>
  );
}

function Heading3Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h8M4 18V6M12 18V6M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2m-1.5 2.5c1.5 1 3.5 0 3.5-1.5a2 2 0 0 0-2-2" />
    </svg>
  );
}

function ParagraphIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

function BlockquoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function HorizontalRuleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  );
}

const FORMAT_ICONS: Record<TextFormat, ReactNode> = {
  bold: <BoldIcon />,
  italic: <ItalicIcon />,
  underline: <UnderlineIcon />,
  strikethrough: <StrikethroughIcon />,
  heading1: <Heading1Icon />,
  heading2: <Heading2Icon />,
  heading3: <Heading3Icon />,
  paragraph: <ParagraphIcon />,
  bulletList: <BulletListIcon />,
  numberedList: <NumberedListIcon />,
  blockquote: <BlockquoteIcon />,
  code: <CodeIcon />,
  link: <LinkIcon />,
  image: <ImageIcon />,
  horizontalRule: <HorizontalRuleIcon />,
  undo: <UndoIcon />,
  redo: <RedoIcon />,
};

const FORMAT_LABELS: Record<TextFormat, string> = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  paragraph: 'Paragraph',
  bulletList: 'Bullet List',
  numberedList: 'Numbered List',
  blockquote: 'Blockquote',
  code: 'Code',
  link: 'Link',
  image: 'Image',
  horizontalRule: 'Horizontal Rule',
  undo: 'Undo',
  redo: 'Redo',
};

// =============================================================================
// RichTextEditor Component
// =============================================================================

export function RichTextEditor({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Start typing...',
  minHeight = 'var(--ds-sizing-40)',
  maxHeight = 'var(--ds-sizing-80)',
  disabled = false,
  readOnly = false,
  toolbar = DEFAULT_TOOLBAR,
  label,
  error,
  helperText,
  required = false,
  className,
  style,
}: RichTextEditorProps): React.ReactElement {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strikethrough');
    if (document.queryCommandState('insertUnorderedList')) formats.add('bulletList');
    if (document.queryCommandState('insertOrderedList')) formats.add('numberedList');
    
    setActiveFormats(formats);
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  }, [onChange, updateActiveFormats]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    updateActiveFormats();
  }, [updateActiveFormats]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleKeyUp = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  const executeCommand = useCallback((format: TextFormat) => {
    if (disabled || readOnly) return;

    editorRef.current?.focus();

    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false);
        break;
      case 'heading1':
        document.execCommand('formatBlock', false, 'h1');
        break;
      case 'heading2':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'heading3':
        document.execCommand('formatBlock', false, 'h3');
        break;
      case 'paragraph':
        document.execCommand('formatBlock', false, 'p');
        break;
      case 'bulletList':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'numberedList':
        document.execCommand('insertOrderedList', false);
        break;
      case 'blockquote':
        document.execCommand('formatBlock', false, 'blockquote');
        break;
      case 'code':
        document.execCommand('formatBlock', false, 'pre');
        break;
      case 'link': {
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      }
      case 'image': {
        const imgUrl = prompt('Enter image URL:');
        if (imgUrl) {
          document.execCommand('insertImage', false, imgUrl);
        }
        break;
      }
      case 'horizontalRule':
        document.execCommand('insertHorizontalRule', false);
        break;
      case 'undo':
        document.execCommand('undo', false);
        break;
      case 'redo':
        document.execCommand('redo', false);
        break;
    }

    handleInput();
    updateActiveFormats();
  }, [disabled, readOnly, handleInput, updateActiveFormats]);

  const borderColor = error
    ? 'var(--ds-color-danger-border-default)'
    : isFocused
    ? 'var(--ds-color-accent-border-default)'
    : 'var(--ds-color-neutral-border-default)';

  return (
    <div className={className} style={style}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--ds-spacing-2)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--ds-color-danger-text-default)', marginLeft: 'var(--ds-spacing-1)' }}>*</span>
          )}
        </label>
      )}

      <div
        style={{
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor,
          borderRadius: 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
          backgroundColor: disabled
            ? 'var(--ds-color-neutral-surface-subtle)'
            : 'var(--ds-color-neutral-background-default)',
          transition: 'border-color 0.15s ease',
        }}
      >
        {!readOnly && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--ds-spacing-1)',
              padding: 'var(--ds-spacing-2)',
              borderBottomWidth: 'var(--ds-border-width-default)',
              borderBottomStyle: 'solid',
              borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            }}
          >
            {toolbar.map((format, index) => {
              const isActive = activeFormats.has(format);
              const isSeparator = 
                (format === 'paragraph' && index > 0) ||
                (format === 'bulletList' && index > 0) ||
                (format === 'link' && index > 0) ||
                (format === 'undo' && index > 0);

              return (
                <React.Fragment key={format}>
                  {isSeparator && (
                    <div
                      style={{
                        width: 'var(--ds-border-width-default)',
                        height: 'var(--ds-sizing-6)',
                        backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                        margin: '0 var(--ds-spacing-1)',
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => executeCommand(format)}
                    disabled={disabled}
                    title={FORMAT_LABELS[format]}
                    aria-label={FORMAT_LABELS[format]}
                    aria-pressed={isActive}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'var(--ds-spacing-1-5)',
                      backgroundColor: isActive
                        ? 'var(--ds-color-accent-surface-default)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--ds-color-accent-text-default)'
                        : 'var(--ds-color-neutral-text-default)',
                      borderWidth: '0',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.5 : 1,
                      transition: 'background-color 0.15s ease, color 0.15s ease',
                    }}
                  >
                    {FORMAT_ICONS[format]}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable={!disabled && !readOnly}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyUp={handleKeyUp}
          data-placeholder={placeholder}
          style={{
            minHeight,
            maxHeight,
            padding: 'var(--ds-spacing-4)',
            fontSize: 'var(--ds-font-size-md)',
            lineHeight: 1.6,
            color: 'var(--ds-color-neutral-text-default)',
            outline: 'none',
            overflowY: 'auto',
          }}
          suppressContentEditableWarning
        />
      </div>

      {(error || helperText) && (
        <p
          style={{
            marginTop: 'var(--ds-spacing-1)',
            fontSize: 'var(--ds-font-size-sm)',
            color: error
              ? 'var(--ds-color-danger-text-default)'
              : 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {error || helperText}
        </p>
      )}

      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--ds-color-neutral-text-subtle);
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: var(--ds-font-size-heading-lg); font-weight: var(--ds-font-weight-bold); margin: var(--ds-spacing-4) 0 var(--ds-spacing-2) 0; }
        [contenteditable] h2 { font-size: var(--ds-font-size-heading-md); font-weight: var(--ds-font-weight-semibold); margin: var(--ds-spacing-3) 0 var(--ds-spacing-2) 0; }
        [contenteditable] h3 { font-size: var(--ds-font-size-heading-sm); font-weight: var(--ds-font-weight-semibold); margin: var(--ds-spacing-3) 0 var(--ds-spacing-2) 0; }
        [contenteditable] p { margin: var(--ds-spacing-2) 0; }
        [contenteditable] ul, [contenteditable] ol { margin: var(--ds-spacing-2) 0; padding-left: var(--ds-spacing-6); }
        [contenteditable] li { margin: var(--ds-spacing-1) 0; }
        [contenteditable] blockquote { margin: var(--ds-spacing-3) 0; padding: var(--ds-spacing-3) var(--ds-spacing-4); border-left: 4px solid var(--ds-color-accent-border-default); background-color: var(--ds-color-neutral-surface-subtle); font-style: italic; }
        [contenteditable] pre { margin: var(--ds-spacing-3) 0; padding: var(--ds-spacing-3); background-color: var(--ds-color-neutral-surface-default); border-radius: var(--ds-border-radius-md); font-family: var(--ds-font-family-monospace); font-size: var(--ds-font-size-sm); overflow-x: auto; }
        [contenteditable] a { color: var(--ds-color-accent-text-default); text-decoration: underline; }
        [contenteditable] img { max-width: 100%; height: auto; border-radius: var(--ds-border-radius-md); }
        [contenteditable] hr { border: none; border-top: 1px solid var(--ds-color-neutral-border-default); margin: var(--ds-spacing-4) 0; }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
