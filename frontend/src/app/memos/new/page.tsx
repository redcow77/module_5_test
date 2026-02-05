'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMemo } from '@/lib/api';
import MemoEditor from '@/components/memos/MemoEditor';

export default function NewMemoPage() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave(title: string, content: string) {
    setSaving(true);
    try {
      const memo = await createMemo({ title, content });
      router.push(`/memos/${memo.id}`);
    } catch (error) {
      console.error('Failed to create memo:', error);
      alert('Failed to create memo');
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push('/memos');
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <button
              onClick={() => router.push('/memos')}
              className="hover:text-gray-700"
            >
              Memos
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900">New Memo</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">Create New Memo</h1>
        </div>

        <MemoEditor
          initialTitle=""
          initialContent=""
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      </div>
    </main>
  );
}
