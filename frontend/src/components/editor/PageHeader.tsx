'use client';

import { useState, useRef, useEffect } from 'react';
import { updatePage } from '@/lib/api';

interface PageHeaderProps {
  pageId: number;
  title: string;
  icon: string | null;
  createdAt: string;
  onUpdate: () => void;
}

export default function PageHeader({
  pageId,
  title,
  icon,
  createdAt,
  onUpdate,
}: PageHeaderProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingIcon, setEditingIcon] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [iconValue, setIconValue] = useState(icon || '📄');
  const titleRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleValue(title);
  }, [title]);

  useEffect(() => {
    setIconValue(icon || '📄');
  }, [icon]);

  async function handleTitleBlur() {
    setEditingTitle(false);
    if (titleValue.trim() !== title) {
      try {
        await updatePage(pageId, { title: titleValue.trim() || 'Untitled' });
        onUpdate();
      } catch (error) {
        console.error('Failed to update title:', error);
        setTitleValue(title);
      }
    }
  }

  async function handleIconBlur() {
    setEditingIcon(false);
    if (iconValue !== icon) {
      try {
        await updatePage(pageId, { icon: iconValue });
        onUpdate();
      } catch (error) {
        console.error('Failed to update icon:', error);
        setIconValue(icon || '📄');
      }
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      titleRef.current?.blur();
    }
  }

  function handleIconKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      iconRef.current?.blur();
    }
  }

  const formattedDate = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-8 py-6">
      {/* Icon */}
      <div className="mb-2">
        {editingIcon ? (
          <input
            ref={iconRef}
            type="text"
            value={iconValue}
            onChange={(e) => setIconValue(e.target.value.slice(0, 2))}
            onBlur={handleIconBlur}
            onKeyDown={handleIconKeyDown}
            className="text-6xl w-20 outline-none border-b border-gray-300 focus:border-blue-500"
            autoFocus
            maxLength={2}
          />
        ) : (
          <button
            onClick={() => setEditingIcon(true)}
            className="text-6xl hover:bg-gray-100 rounded px-2 py-1"
          >
            {iconValue}
          </button>
        )}
      </div>

      {/* Title */}
      <div>
        {editingTitle ? (
          <input
            ref={titleRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-4xl font-bold w-full outline-none border-b border-gray-300 focus:border-blue-500"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => setEditingTitle(true)}
            className="text-4xl font-bold cursor-text hover:bg-gray-50 px-2 py-1 rounded"
          >
            {titleValue}
          </h1>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-4 text-sm text-gray-500">
        Created {formattedDate}
      </div>
    </div>
  );
}
