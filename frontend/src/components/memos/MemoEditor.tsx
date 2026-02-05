'use client';

import { useState } from 'react';

interface MemoEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function MemoEditor({
  initialTitle = '',
  initialContent = '',
  onSave,
  onCancel,
  saving = false,
}: MemoEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      alert('Content is required');
      return;
    }
    onSave(title || 'Untitled Memo', content);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Memo Title"
          className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 placeholder-gray-400"
          disabled={saving}
        />
      </div>

      <div className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your memo here..."
          rows={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={saving}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>AI Processing:</strong> When you save this memo, Claude AI
          will automatically generate a summary and tags for you.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? 'Saving & Processing with AI...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
