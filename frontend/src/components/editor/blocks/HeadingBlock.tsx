'use client';

import { Block } from '@/lib/api';
import { useRef, useEffect } from 'react';

interface HeadingBlockProps {
  block: Block;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
}

export default function HeadingBlock({
  block,
  isEditing,
  onContentChange,
  onKeyDown,
  onClick,
}: HeadingBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      if (contentRef.current.childNodes.length > 0) {
        range.setStart(
          contentRef.current.childNodes[0],
          contentRef.current.textContent?.length || 0
        );
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [isEditing]);

  const getSizeClasses = () => {
    switch (block.type) {
      case 'heading1':
        return 'text-3xl font-bold';
      case 'heading2':
        return 'text-2xl font-bold';
      case 'heading3':
        return 'text-xl font-bold';
      default:
        return 'text-xl font-bold';
    }
  };

  const placeholder = () => {
    switch (block.type) {
      case 'heading1':
        return 'Heading 1';
      case 'heading2':
        return 'Heading 2';
      case 'heading3':
        return 'Heading 3';
      default:
        return 'Heading';
    }
  };

  return (
    <div
      ref={contentRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onInput={(e) => onContentChange(e.currentTarget.textContent || '')}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className={`px-2 py-1 min-h-[1.5rem] outline-none ${getSizeClasses()} ${
        isEditing ? 'cursor-text' : 'cursor-pointer'
      } ${!block.content && !isEditing ? 'text-gray-400' : ''}`}
    >
      {block.content || (isEditing ? '' : placeholder())}
    </div>
  );
}
