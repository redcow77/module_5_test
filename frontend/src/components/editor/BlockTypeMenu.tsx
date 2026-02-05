'use client';

import { Block } from '@/lib/api';
import { useEffect, useState } from 'react';

interface BlockTypeOption {
  type: Block['type'];
  label: string;
  icon: string;
  description: string;
}

const blockTypes: BlockTypeOption[] = [
  { type: 'text', label: 'Text', icon: '📝', description: 'Plain text' },
  { type: 'heading1', label: 'Heading 1', icon: 'H1', description: 'Large heading' },
  { type: 'heading2', label: 'Heading 2', icon: 'H2', description: 'Medium heading' },
  { type: 'heading3', label: 'Heading 3', icon: 'H3', description: 'Small heading' },
  { type: 'bullet_list', label: 'Bulleted List', icon: '•', description: 'Create a list' },
  { type: 'numbered_list', label: 'Numbered List', icon: '1.', description: 'Create a numbered list' },
  { type: 'todo', label: 'To-do', icon: '☐', description: 'Track tasks' },
  { type: 'code', label: 'Code', icon: '</>', description: 'Code snippet' },
  { type: 'quote', label: 'Quote', icon: '"', description: 'Capture a quote' },
  { type: 'divider', label: 'Divider', icon: '—', description: 'Visually divide blocks' },
];

interface BlockTypeMenuProps {
  position: { top: number; left: number };
  onSelect: (type: Block['type']) => void;
  onClose: () => void;
}

export default function BlockTypeMenu({
  position,
  onSelect,
  onClose,
}: BlockTypeMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % blockTypes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + blockTypes.length) % blockTypes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(blockTypes[selectedIndex].type);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelect, onClose]);

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-w-xs"
      style={{ top: position.top, left: position.left }}
    >
      <div className="text-xs text-gray-500 px-3 py-1 font-semibold">BASIC BLOCKS</div>
      {blockTypes.map((option, index) => (
        <button
          key={option.type}
          onClick={() => onSelect(option.type)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={`w-full text-left px-3 py-2 flex items-center gap-3 transition ${
            index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <span className="text-lg w-6 text-center flex-shrink-0">{option.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900">{option.label}</div>
            <div className="text-xs text-gray-500">{option.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
