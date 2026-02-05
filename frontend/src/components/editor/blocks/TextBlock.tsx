'use client';

import { Block } from '@/lib/api';
import { useRef, useEffect } from 'react';

interface TextBlockProps {
  block: Block;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
}

export default function TextBlock({
  block,
  isEditing,
  onContentChange,
  onKeyDown,
  onClick,
}: TextBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      // Place cursor at the end
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
    <div
      ref={contentRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onInput={(e) => onContentChange(e.currentTarget.textContent || '')}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className={`px-2 py-1 min-h-[1.5rem] text-base outline-none ${
        isEditing ? 'cursor-text' : 'cursor-pointer'
      } ${!block.content && !isEditing ? 'text-gray-400' : ''}`}
    >
      {block.content || (isEditing ? '' : 'Empty block')}
    </div>
  );
}
