'use client';

import { Block } from '@/lib/api';
import { useRef, useEffect, useState } from 'react';

interface TodoBlockProps {
  block: Block;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
}

export default function TodoBlock({
  block,
  isEditing,
  onContentChange,
  onKeyDown,
  onClick,
}: TodoBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  // Parse content to check if it starts with [x] or [ ]
  const [checked, setChecked] = useState(block.content.startsWith('[x]'));

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

  const toggleChecked = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    const textContent = block.content.replace(/^\[(x| )\]\s*/, '');
    onContentChange(`[${newChecked ? 'x' : ' '}] ${textContent}`);
  };

  const getDisplayContent = () => {
    return block.content.replace(/^\[(x| )\]\s*/, '');
  };

  return (
    <div className="flex items-start gap-2 px-2 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={toggleChecked}
        className="mt-1 w-4 h-4 rounded border-gray-300 cursor-pointer"
      />
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={(e) => {
          const textContent = e.currentTarget.textContent || '';
          onContentChange(`[${checked ? 'x' : ' '}] ${textContent}`);
        }}
        onKeyDown={onKeyDown}
        onClick={onClick}
        className={`flex-1 min-h-[1.5rem] text-base outline-none ${
          isEditing ? 'cursor-text' : 'cursor-pointer'
        } ${checked ? 'line-through text-gray-500' : ''} ${
          !getDisplayContent() && !isEditing ? 'text-gray-400' : ''
        }`}
      >
        {getDisplayContent() || (isEditing ? '' : 'To-do')}
      </div>
    </div>
  );
}
