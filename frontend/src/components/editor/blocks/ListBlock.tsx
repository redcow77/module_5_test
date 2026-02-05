'use client';

import { Block } from '@/lib/api';
import { useRef, useEffect } from 'react';

interface ListBlockProps {
  block: Block;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
}

export default function ListBlock({
  block,
  isEditing,
  onContentChange,
  onKeyDown,
  onClick,
}: ListBlockProps) {
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

  const isBullet = block.type === 'bullet_list';

  return (
    <div className="flex items-start gap-2 px-2 py-1">
      <span className="flex-shrink-0 mt-1 text-gray-600 select-none">
        {isBullet ? '•' : '1.'}
      </span>
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={(e) => onContentChange(e.currentTarget.textContent || '')}
        onKeyDown={onKeyDown}
        onClick={onClick}
        className={`flex-1 min-h-[1.5rem] text-base outline-none ${
          isEditing ? 'cursor-text' : 'cursor-pointer'
        } ${!block.content && !isEditing ? 'text-gray-400' : ''}`}
      >
        {block.content || (isEditing ? '' : 'List item')}
      </div>
    </div>
  );
}
