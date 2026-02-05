'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Memo, getMemo, updateMemo, deleteMemo, regenerateAI } from '@/lib/api';
import MemoEditor from '@/components/memos/MemoEditor';
import TagChip from '@/components/memos/TagChip';

export default function MemoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memoId = parseInt(params.id as string);

  const [memo, setMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadMemo();
  }, [memoId]);

  async function loadMemo() {
    try {
      setLoading(true);
      const data = await getMemo(memoId);
      setMemo(data);
    } catch (error) {
      console.error('Failed to load memo:', error);
      alert('Failed to load memo');
      router.push('/memos');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(title: string, content: string) {
    setSaving(true);
    try {
      const updated = await updateMemo(memoId, { title, content });
      setMemo(updated);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update memo:', error);
      alert('Failed to update memo');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this memo?')) return;

    try {
      await deleteMemo(memoId);
      router.push('/memos');
    } catch (error) {
      console.error('Failed to delete memo:', error);
      alert('Failed to delete memo');
    }
  }

  async function handleRegenerateAI() {
    if (!confirm('Regenerate AI summary and tags for this memo?')) return;

    setRegenerating(true);
    try {
      const updated = await regenerateAI(memoId);
      setMemo(updated);
    } catch (error) {
      console.error('Failed to regenerate AI:', error);
      alert('Failed to regenerate AI content');
    } finally {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (!memo) {
    return null;
  }

  if (editing) {
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
              <span className="text-gray-900">Edit</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">Edit Memo</h1>
          </div>

          <MemoEditor
            initialTitle={memo.title}
            initialContent={memo.content}
            onSave={handleUpdate}
            onCancel={() => setEditing(false)}
            saving={saving}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <button
            onClick={() => router.push('/memos')}
            className="hover:text-gray-700"
          >
            Memos
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{memo.title}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {memo.title}
          </h1>
          <p className="text-sm text-gray-500">
            Created: {new Date(memo.created_at).toLocaleString('ko-KR')}
          </p>
        </div>

        {memo.ai_summary ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-lg font-semibold text-blue-900">
                AI Summary
              </h2>
              <button
                onClick={handleRegenerateAI}
                disabled={regenerating}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
            <p className="text-blue-800">{memo.ai_summary}</p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              AI Summary Not Available
            </h2>
            <p className="text-yellow-800 mb-3">
              The AI summary could not be generated for this memo.
            </p>
            <button
              onClick={handleRegenerateAI}
              disabled={regenerating}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition"
            >
              {regenerating ? 'Generating...' : 'Generate Now'}
            </button>
          </div>
        )}

        {memo.tags && memo.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {memo.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Content</h2>
          <div className="prose max-w-none whitespace-pre-wrap bg-gray-50 rounded-lg p-5 text-gray-800">
            {memo.content}
          </div>
        </div>

        <div className="flex gap-3 border-t pt-6">
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
          <button
            onClick={() => router.push('/memos')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </main>
  );
}
