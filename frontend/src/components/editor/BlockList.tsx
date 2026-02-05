'use client';

import { Block } from '@/lib/api';

interface BlockListProps {
  blocks: Block[];
}

export default function BlockList({ blocks }: BlockListProps) {
  function renderBlock(block: Block) {
    const baseClasses = 'px-2 py-1 min-h-[1.5rem]';

    switch (block.type) {
      case 'heading1':
        return (
          <h1 className={`text-3xl font-bold ${baseClasses}`}>
            {block.content || 'Heading 1'}
          </h1>
        );
      case 'heading2':
        return (
          <h2 className={`text-2xl font-bold ${baseClasses}`}>
            {block.content || 'Heading 2'}
          </h2>
        );
      case 'heading3':
        return (
          <h3 className={`text-xl font-bold ${baseClasses}`}>
            {block.content || 'Heading 3'}
          </h3>
        );
      case 'code':
        return (
          <pre className={`bg-gray-100 rounded p-3 overflow-x-auto font-mono text-sm ${baseClasses}`}>
            <code>{block.content || '// code'}</code>
          </pre>
        );
      case 'quote':
        return (
          <blockquote className={`border-l-4 border-gray-300 pl-4 italic text-gray-700 ${baseClasses}`}>
            {block.content || 'Quote'}
          </blockquote>
        );
      case 'text':
      default:
        return (
          <p className={`text-base ${baseClasses}`}>
            {block.content || ''}
          </p>
        );
    }
  }

  if (blocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-4">
        <p className="text-gray-400 text-sm">
          No content yet. Blocks will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-4 space-y-2">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <div key={block.id} className="group">
            {renderBlock(block)}
          </div>
        ))}
    </div>
  );
}
