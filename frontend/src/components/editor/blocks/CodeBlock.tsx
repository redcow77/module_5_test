'use client';

import { Block } from '@/lib/api';
import { useRef, useEffect } from 'react';

interface CodeBlockProps {
  block: Block;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
}

export default function CodeBlock({
  block,
  isEditing,
  onContentChange,
  onKeyDown,
  onClick,
}: CodeBlockProps) {
  const contentRef = useRef<HTMLPreElement>(null);

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
    <pre
      ref={contentRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onInput={(e) => onContentChange(e.currentTarget.textContent || '')}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className={`bg-gray-100 rounded p-3 overflow-x-auto font-mono text-sm outline-none ${
        isEditing ? 'cursor-text' : 'cursor-pointer'
      } ${!block.content && !isEditing ? 'text-gray-400' : ''}`}
    >
      {block.content || (isEditing ? '' : '// code')}
    </pre>
  );
}
