'use client';

import { Block, updateBlock, deleteBlock, createBlock, reorderBlocks } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ListBlock from './blocks/ListBlock';
import TodoBlock from './blocks/TodoBlock';
import CodeBlock from './blocks/CodeBlock';
import QuoteBlock from './blocks/QuoteBlock';
import DividerBlock from './blocks/DividerBlock';
import BlockTypeMenu from './BlockTypeMenu';

interface BlockListProps {
  blocks: Block[];
  pageId: number;
  onBlocksChange: () => void;
}

interface SortableBlockProps {
  block: Block;
  isEditing: boolean;
  onEdit: () => void;
  onContentChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onDelete: () => void;
  onAddBelow: () => void;
}

function SortableBlock({
  block,
  isEditing,
  onEdit,
  onContentChange,
  onKeyDown,
  onDelete,
  onAddBelow,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderBlock = () => {
    const commonProps = {
      block,
      isEditing,
      onContentChange,
      onKeyDown,
      onClick: onEdit,
    };

    switch (block.type) {
      case 'heading1':
      case 'heading2':
      case 'heading3':
        return <HeadingBlock {...commonProps} />;
      case 'bullet_list':
      case 'numbered_list':
        return <ListBlock {...commonProps} />;
      case 'todo':
        return <TodoBlock {...commonProps} />;
      case 'code':
        return <CodeBlock {...commonProps} />;
      case 'quote':
        return <QuoteBlock {...commonProps} />;
      case 'divider':
        return <DividerBlock onClick={onEdit} />;
      case 'text':
      default:
        return <TextBlock {...commonProps} />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      {/* Drag Handle and Actions */}
      <div className="absolute left-0 top-0 -ml-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>
        <button
          onClick={onAddBelow}
          className="p-1 hover:bg-gray-100 rounded"
          title="Add block below"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-gray-100 rounded text-red-500"
          title="Delete block"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Block Content */}
      {renderBlock()}
    </div>
  );
}

export default function BlockList({ blocks, pageId, onBlocksChange }: BlockListProps) {
  const [localBlocks, setLocalBlocks] = useState<Block[]>(blocks);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [showTypeMenu, setShowTypeMenu] = useState<{
    blockId: number;
    position: { top: number; left: number };
  } | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalBlocks(blocks.sort((a, b) => a.order - b.order));
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const debouncedSave = (blockId: number, content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateBlock(blockId, { content });
        onBlocksChange();
      } catch (error) {
        console.error('Failed to save block:', error);
      }
    }, 500);
  };

  const handleContentChange = (blockId: number, content: string) => {
    setLocalBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content } : b))
    );
    debouncedSave(blockId, content);
  };

  const handleKeyDown = async (blockId: number, e: React.KeyboardEvent) => {
    const block = localBlocks.find((b) => b.id === blockId);
    if (!block) return;

    // Check for slash command
    if (e.key === '/' && !block.content) {
      e.preventDefault();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setShowTypeMenu({
        blockId,
        position: { top: rect.bottom + 5, left: rect.left },
      });
      return;
    }

    // Enter: Create new block below
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      try {
        const newBlock = await createBlock({
          page_id: pageId,
          type: 'text',
          content: '',
          order: block.order + 1,
        });
        // Reorder subsequent blocks
        const updatedOrders = localBlocks
          .filter((b) => b.order > block.order)
          .map((b) => ({ id: b.id, order: b.order + 1 }));
        if (updatedOrders.length > 0) {
          await reorderBlocks({ block_orders: updatedOrders });
        }
        onBlocksChange();
        setTimeout(() => setEditingBlockId(newBlock.id), 100);
      } catch (error) {
        console.error('Failed to create block:', error);
      }
    }

    // Backspace on empty block: Delete it
    if (e.key === 'Backspace' && !block.content && localBlocks.length > 1) {
      e.preventDefault();
      try {
        await deleteBlock(blockId);
        onBlocksChange();
      } catch (error) {
        console.error('Failed to delete block:', error);
      }
    }
  };

  const handleTypeSelect = async (blockId: number, type: Block['type']) => {
    try {
      await updateBlock(blockId, { type, content: '' });
      setShowTypeMenu(null);
      onBlocksChange();
    } catch (error) {
      console.error('Failed to update block type:', error);
    }
  };

  const handleDelete = async (blockId: number) => {
    if (localBlocks.length === 1) {
      alert('Cannot delete the last block');
      return;
    }
    try {
      await deleteBlock(blockId);
      onBlocksChange();
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  const handleAddBelow = async (blockId: number) => {
    const block = localBlocks.find((b) => b.id === blockId);
    if (!block) return;

    try {
      const newBlock = await createBlock({
        page_id: pageId,
        type: 'text',
        content: '',
        order: block.order + 1,
      });
      // Reorder subsequent blocks
      const updatedOrders = localBlocks
        .filter((b) => b.order > block.order)
        .map((b) => ({ id: b.id, order: b.order + 1 }));
      if (updatedOrders.length > 0) {
        await reorderBlocks({ block_orders: updatedOrders });
      }
      onBlocksChange();
      setTimeout(() => setEditingBlockId(newBlock.id), 100);
    } catch (error) {
      console.error('Failed to create block:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localBlocks.findIndex((b) => b.id === active.id);
      const newIndex = localBlocks.findIndex((b) => b.id === over.id);

      const reordered = arrayMove(localBlocks, oldIndex, newIndex);
      setLocalBlocks(reordered);

      // Update order values
      const updatedOrders = reordered.map((b, index) => ({
        id: b.id,
        order: index,
      }));

      try {
        await reorderBlocks({ block_orders: updatedOrders });
        onBlocksChange();
      } catch (error) {
        console.error('Failed to reorder blocks:', error);
        setLocalBlocks(blocks);
      }
    }
  };

  if (localBlocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-4">
        <p className="text-gray-400 text-sm">
          No content yet. Click below to add blocks.
        </p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localBlocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="max-w-4xl mx-auto px-8 py-4 space-y-1">
            {localBlocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                isEditing={editingBlockId === block.id}
                onEdit={() => setEditingBlockId(block.id)}
                onContentChange={(content) => handleContentChange(block.id, content)}
                onKeyDown={(e) => handleKeyDown(block.id, e)}
                onDelete={() => handleDelete(block.id)}
                onAddBelow={() => handleAddBelow(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showTypeMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowTypeMenu(null)}
          />
          <BlockTypeMenu
            position={showTypeMenu.position}
            onSelect={(type) => handleTypeSelect(showTypeMenu.blockId, type)}
            onClose={() => setShowTypeMenu(null)}
          />
        </>
      )}
    </>
  );
}
