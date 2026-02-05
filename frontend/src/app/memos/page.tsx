'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Memo, listMemos, searchMemos } from '@/lib/api';
import MemoCard from '@/components/memos/MemoCard';
import SearchBar from '@/components/memos/SearchBar';

export default function MemosPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadMemos();
  }, []);

  async function loadMemos() {
    try {
      setLoading(true);
      const data = await listMemos();
      setMemos(data);
    } catch (error) {
      console.error('Failed to load memos:', error);
      alert('Failed to load memos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    try {
      const results = await searchMemos(query);
      setMemos(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Memo</h1>
          <p className="text-gray-600">
            Claude AI가 자동으로 메모를 요약하고 태그를 생성합니다.
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} onReset={loadMemos} />
          </div>
          <button
            onClick={() => router.push('/memos/new')}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
          >
            <span className="text-xl">+</span>
            <span>New Memo</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : memos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">
              No memos yet. Create your first memo to get started!
            </p>
            <button
              onClick={() => router.push('/memos/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <span className="text-xl">+</span>
              <span>Create First Memo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memos.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                onClick={() => router.push(`/memos/${memo.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
