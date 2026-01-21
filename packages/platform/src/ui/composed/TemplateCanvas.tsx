/**
 * TemplateCanvas Component
 *
 * A drag-and-drop canvas for creating email/invoice templates.
 * Supports blocks, placeholders, and preview modes.
 *
 * SSR-safe: Uses 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/TemplateCanvas
 */

'use client';

import React, { useState, useCallback, useRef, type ReactNode, type DragEvent } from 'react';

// =============================================================================
// Types
// =============================================================================

export type BlockType = 
  | 'header'
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'columns'
  | 'table'
  | 'footer'
  | 'placeholder';

export interface TemplateBlock {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  styles?: Record<string, string>;
}

export interface TemplatePlaceholder {
  id: string;
  name: string;
  description?: string;
  defaultValue?: string;
}

export interface TemplateCanvasProps {
  blocks: TemplateBlock[];
  onChange: (blocks: TemplateBlock[]) => void;
  placeholders?: TemplatePlaceholder[];
  previewMode?: boolean;
  previewData?: Record<string, string>;
  availableBlocks?: BlockType[];
  onBlockSelect?: (block: TemplateBlock) => void;
  selectedBlockId?: string;
  maxWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface BlockPaletteProps {
  availableBlocks: BlockType[];
  onDragStart: (type: BlockType) => void;
}

// =============================================================================
// Icons
// =============================================================================

function TypeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}

function ColumnsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function GripVerticalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

const BLOCK_ICONS: Record<BlockType, ReactNode> = {
  header: <TypeIcon />,
  text: <TypeIcon />,
  image: <ImageIcon />,
  button: <SquareIcon />,
  divider: <MinusIcon />,
  spacer: <MoveIcon />,
  columns: <ColumnsIcon />,
  table: <TableIcon />,
  footer: <TypeIcon />,
  placeholder: <HashIcon />,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  header: 'Header',
  text: 'Text Block',
  image: 'Image',
  button: 'Button',
  divider: 'Divider',
  spacer: 'Spacer',
  columns: 'Columns',
  table: 'Table',
  footer: 'Footer',
  placeholder: 'Placeholder',
};

// =============================================================================
// Helpers
// =============================================================================

function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultBlock(type: BlockType): TemplateBlock {
  const id = generateId();
  
  switch (type) {
    case 'header':
      return { id, type, content: { text: 'Header Title', level: 1 } };
    case 'text':
      return { id, type, content: { text: 'Enter your text here...' } };
    case 'image':
      return { id, type, content: { src: '', alt: 'Image' } };
    case 'button':
      return { id, type, content: { text: 'Click Here', url: '#' } };
    case 'divider':
      return { id, type, content: {} };
    case 'spacer':
      return { id, type, content: { height: '20px' } };
    case 'columns':
      return { id, type, content: { columns: 2 } };
    case 'table':
      return { id, type, content: { rows: 3, cols: 3, data: [] } };
    case 'footer':
      return { id, type, content: { text: '© 2026 Company Name' } };
    case 'placeholder':
      return { id, type, content: { name: 'placeholder_name' } };
    default:
      return { id, type, content: {} };
  }
}

// =============================================================================
// BlockPalette Component
// =============================================================================

export function BlockPalette({
  availableBlocks,
  onDragStart,
}: BlockPaletteProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--ds-spacing-2)',
        padding: 'var(--ds-spacing-3)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
      }}
    >
      {availableBlocks.map((type) => (
        <div
          key={type}
          draggable
          onDragStart={() => onDragStart(type)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            cursor: 'grab',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {BLOCK_ICONS[type]}
          </div>
          <span
            style={{
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-default)',
              textAlign: 'center',
            }}
          >
            {BLOCK_LABELS[type]}
          </span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// BlockRenderer Component
// =============================================================================

interface BlockRendererProps {
  block: TemplateBlock;
  isSelected: boolean;
  previewMode: boolean;
  previewData?: Record<string, string>;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function BlockRenderer({
  block,
  isSelected,
  previewMode,
  previewData,
  onSelect,
  onDelete,
  onDuplicate,
}: BlockRendererProps): React.ReactElement {
  const renderContent = () => {
    switch (block.type) {
      case 'header':
        return (
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--ds-font-size-heading-lg)',
              fontWeight: 'var(--ds-font-weight-bold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {block.content.text as string}
          </h1>
        );
      case 'text':
        return (
          <p
            style={{
              margin: 0,
              fontSize: 'var(--ds-font-size-md)',
              lineHeight: 1.6,
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {block.content.text as string}
          </p>
        );
      case 'image':
        return block.content.src ? (
          <img
            src={block.content.src as string}
            alt={block.content.alt as string}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'var(--ds-sizing-32)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            <ImageIcon />
          </div>
        );
      case 'button':
        return (
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
              fontSize: 'var(--ds-font-size-md)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'white',
              backgroundColor: 'var(--ds-color-accent-base-default)',
              borderWidth: '0',
              borderRadius: 'var(--ds-border-radius-md)',
              cursor: previewMode ? 'pointer' : 'default',
            }}
          >
            {block.content.text as string}
          </button>
        );
      case 'divider':
        return (
          <hr
            style={{
              margin: 'var(--ds-spacing-4) 0',
              border: 'none',
              borderTopWidth: 'var(--ds-border-width-default)',
              borderTopStyle: 'solid',
              borderTopColor: 'var(--ds-color-neutral-border-default)',
            }}
          />
        );
      case 'spacer':
        return (
          <div
            style={{
              height: (block.content.height as string) || 'var(--ds-spacing-5)',
              backgroundColor: previewMode ? 'transparent' : 'var(--ds-color-neutral-surface-subtle)',
            }}
          />
        );
      case 'placeholder':
        const placeholderName = block.content.name as string;
        const value = previewData?.[placeholderName] || `{{${placeholderName}}}`;
        return (
          <span
            style={{
              display: 'inline-block',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              backgroundColor: previewMode ? 'transparent' : 'var(--ds-color-warning-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-sm)',
              fontFamily: previewMode ? 'inherit' : 'var(--ds-font-family-monospace)',
              fontSize: 'var(--ds-font-size-sm)',
              color: previewMode ? 'inherit' : 'var(--ds-color-warning-text-default)',
            }}
          >
            {value}
          </span>
        );
      case 'table':
        const rows = (block.content.rows as number) || 3;
        const cols = (block.content.cols as number) || 3;
        return (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: cols }).map((_, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        padding: 'var(--ds-spacing-2)',
                        borderWidth: 'var(--ds-border-width-default)',
                        borderStyle: 'solid',
                        borderColor: 'var(--ds-color-neutral-border-default)',
                        fontSize: 'var(--ds-font-size-sm)',
                      }}
                    >
                      {rowIndex === 0 ? `Header ${colIndex + 1}` : `Cell ${rowIndex}-${colIndex + 1}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'footer':
        return (
          <div
            style={{
              padding: 'var(--ds-spacing-4)',
              textAlign: 'center',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          >
            {block.content.text as string}
          </div>
        );
      default:
        return <div>Unknown block type</div>;
    }
  };

  if (previewMode) {
    return <div>{renderContent()}</div>;
  }

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        padding: 'var(--ds-spacing-3)',
        borderWidth: isSelected ? 'var(--ds-border-width-lg)' : 'var(--ds-border-width-default)',
        borderStyle: isSelected ? 'solid' : 'dashed',
        borderColor: isSelected ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--ds-spacing-1)',
            right: 'var(--ds-spacing-1)',
            display: 'flex',
            gap: 'var(--ds-spacing-1)',
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            aria-label="Duplicate block"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-1)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderWidth: 'var(--ds-border-width-default)',
              borderStyle: 'solid',
              borderColor: 'var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-sm)',
              cursor: 'pointer',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            <CopyIcon />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete block"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-1)',
              backgroundColor: 'var(--ds-color-danger-surface-subtle)',
              borderWidth: 'var(--ds-border-width-default)',
              borderStyle: 'solid',
              borderColor: 'var(--ds-color-danger-border-default)',
              borderRadius: 'var(--ds-border-radius-sm)',
              cursor: 'pointer',
              color: 'var(--ds-color-danger-text-default)',
            }}
          >
            <TrashIcon />
          </button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-2)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <GripVerticalIcon />
        <span style={{ fontSize: 'var(--ds-font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {BLOCK_LABELS[block.type]}
        </span>
      </div>

      {renderContent()}
    </div>
  );
}

// =============================================================================
// TemplateCanvas Component
// =============================================================================

const DEFAULT_AVAILABLE_BLOCKS: BlockType[] = [
  'header',
  'text',
  'image',
  'button',
  'divider',
  'spacer',
  'table',
  'footer',
  'placeholder',
];

export function TemplateCanvas({
  blocks,
  onChange,
  placeholders,
  previewMode = false,
  previewData,
  availableBlocks = DEFAULT_AVAILABLE_BLOCKS,
  onBlockSelect,
  selectedBlockId,
  maxWidth = '600px',
  className,
  style,
}: TemplateCanvasProps): React.ReactElement {
  const [draggedType, setDraggedType] = useState<BlockType | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((type: BlockType) => {
    setDraggedType(type);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, index: number) => {
    e.preventDefault();
    setDropIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedType(null);
    setDropIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent, index: number) => {
      e.preventDefault();
      if (draggedType) {
        const newBlock = createDefaultBlock(draggedType);
        const newBlocks = [...blocks];
        newBlocks.splice(index, 0, newBlock);
        onChange(newBlocks);
      }
      setDraggedType(null);
      setDropIndex(null);
    },
    [draggedType, blocks, onChange]
  );

  const handleBlockSelect = useCallback(
    (block: TemplateBlock) => {
      onBlockSelect?.(block);
    },
    [onBlockSelect]
  );

  const handleBlockDelete = useCallback(
    (id: string) => {
      onChange(blocks.filter((b) => b.id !== id));
    },
    [blocks, onChange]
  );

  const handleBlockDuplicate = useCallback(
    (block: TemplateBlock) => {
      const index = blocks.findIndex((b) => b.id === block.id);
      if (index !== -1) {
        const newBlock = { ...block, id: generateId() };
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        onChange(newBlocks);
      }
    },
    [blocks, onChange]
  );

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-4)',
        ...style,
      }}
    >
      {!previewMode && (
        <div style={{ width: 'var(--ds-sizing-50)', flexShrink: 0 }}>
          <h4
            style={{
              margin: '0 0 var(--ds-spacing-3) 0',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Blocks
          </h4>
          <BlockPalette availableBlocks={availableBlocks} onDragStart={handleDragStart} />

          {placeholders && placeholders.length > 0 && (
            <>
              <h4
                style={{
                  margin: 'var(--ds-spacing-5) 0 var(--ds-spacing-3) 0',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                Placeholders
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-2)',
                }}
              >
                {placeholders.map((ph) => (
                  <div
                    key={ph.id}
                    style={{
                      padding: 'var(--ds-spacing-2)',
                      backgroundColor: 'var(--ds-color-warning-surface-subtle)',
                      borderRadius: 'var(--ds-border-radius-md)',
                    }}
                  >
                    <code
                      style={{
                        fontSize: 'var(--ds-font-size-xs)',
                        color: 'var(--ds-color-warning-text-default)',
                      }}
                    >
                      {`{{${ph.name}}}`}
                    </code>
                    {ph.description && (
                      <p
                        style={{
                          margin: 'var(--ds-spacing-1) 0 0 0',
                          fontSize: 'var(--ds-font-size-xs)',
                          color: 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        {ph.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div
        ref={canvasRef}
        style={{
          flex: 1,
          maxWidth,
          margin: '0 auto',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: previewMode ? 'white' : 'var(--ds-color-neutral-surface-subtle)',
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: 'var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-lg)',
          minHeight: 'var(--ds-sizing-80)',
        }}
        onDragEnd={handleDragEnd}
      >
        {blocks.length === 0 && !previewMode && (
          <div
            onDragOver={(e) => handleDragOver(e, 0)}
            onDrop={(e) => handleDrop(e, 0)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-10)',
              borderWidth: 'var(--ds-border-width-lg)',
              borderStyle: 'dashed',
              borderColor: dropIndex === 0 ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-subtle)',
              borderRadius: 'var(--ds-border-radius-lg)',
              backgroundColor: dropIndex === 0 ? 'var(--ds-color-accent-surface-subtle)' : 'transparent',
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 'var(--ds-font-size-md)',
                color: 'var(--ds-color-neutral-text-subtle)',
                textAlign: 'center',
              }}
            >
              Drag blocks here to start building your template
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {!previewMode && (
                <div
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{
                    height: dropIndex === index ? 'var(--ds-spacing-10)' : 'var(--ds-spacing-2)',
                    backgroundColor: dropIndex === index ? 'var(--ds-color-accent-surface-subtle)' : 'transparent',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    transition: 'height 0.15s ease, background-color 0.15s ease',
                  }}
                />
              )}
              <BlockRenderer
                block={block}
                isSelected={selectedBlockId === block.id}
                previewMode={previewMode}
                previewData={previewData}
                onSelect={() => handleBlockSelect(block)}
                onDelete={() => handleBlockDelete(block.id)}
                onDuplicate={() => handleBlockDuplicate(block)}
              />
            </React.Fragment>
          ))}

          {blocks.length > 0 && !previewMode && (
            <div
              onDragOver={(e) => handleDragOver(e, blocks.length)}
              onDrop={(e) => handleDrop(e, blocks.length)}
              style={{
                height: dropIndex === blocks.length ? 'var(--ds-spacing-10)' : 'var(--ds-spacing-2)',
                backgroundColor: dropIndex === blocks.length ? 'var(--ds-color-accent-surface-subtle)' : 'transparent',
                borderRadius: 'var(--ds-border-radius-sm)',
                transition: 'height 0.15s ease, background-color 0.15s ease',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateCanvas;
