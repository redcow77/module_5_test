'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Page, listPages, createPage } from '@/lib/api';

export default function Home() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      const data = await listPages();
      const rootPages = data.filter((p) => p.parent_id === null);
      setPages(rootPages);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePage() {
    if (creating) return;
    setCreating(true);
    try {
      const newPage = await createPage({
        title: 'Untitled',
        icon: '📄',
      });
      router.push(`/pages/${newPage.id}`);
    } catch (error) {
      console.error('Failed to create page:', error);
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Notion Clone
          </h1>
          <p className="text-gray-600">
            Create and organize your pages with a Notion-like interface.
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={handleCreatePage}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <span className="text-xl">+</span>
            <span>{creating ? 'Creating...' : 'New Page'}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No pages yet. Create your first page to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Your Pages
            </h2>
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => router.push(`/pages/${page.id}`)}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
              >
                <span className="text-2xl">{page.icon || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(page.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
