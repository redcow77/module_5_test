'use client';

import { Block } from '@/lib/api';
import { useRef, useEffect } from 'react';

interface QuoteBlockProps {
  block: Block;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
}

export default function QuoteBlock({
  block,
  isEditing,
  onContentChange,
  onKeyDown,
  onClick,
}: QuoteBlockProps) {
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

  return (
    <blockquote className="border-l-4 border-gray-300 pl-4">
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={(e) => onContentChange(e.currentTarget.textContent || '')}
        onKeyDown={onKeyDown}
        onClick={onClick}
        className={`px-2 py-1 min-h-[1.5rem] italic text-gray-700 outline-none ${
          isEditing ? 'cursor-text' : 'cursor-pointer'
        } ${!block.content && !isEditing ? 'text-gray-400' : ''}`}
      >
        {block.content || (isEditing ? '' : 'Quote')}
      </div>
    </blockquote>
  );
}
