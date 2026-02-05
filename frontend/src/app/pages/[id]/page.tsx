'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageWithBlocks, getPage, deletePage, createBlock } from '@/lib/api';
import PageHeader from '@/components/editor/PageHeader';
import BlockList from '@/components/editor/BlockList';

export default function PageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = parseInt(params.id as string);

  const [page, setPage] = useState<PageWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  async function loadPage() {
    try {
      const data = await getPage(pageId);
      setPage(data);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this page?')) return;

    setDeleting(true);
    try {
      await deletePage(pageId);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete page:', error);
      setDeleting(false);
    }
  }

  async function handleAddBlock() {
    try {
      const maxOrder = page?.blocks.length
        ? Math.max(...page.blocks.map((b) => b.order))
        : -1;
      await createBlock({
        page_id: pageId,
        type: 'text',
        content: '',
        order: maxOrder + 1,
      });
      loadPage();
    } catch (error) {
      console.error('Failed to create block:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Page not found</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 px-8 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => router.push('/')}
            className="hover:text-gray-900"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-gray-900">{page.title}</span>
        </nav>
      </div>

      {/* Page Header */}
      <PageHeader
        pageId={page.id}
        title={page.title}
        icon={page.icon}
        createdAt={page.created_at}
        onUpdate={loadPage}
      />

      {/* Blocks */}
      {page.blocks.length === 0 ? (
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400 mb-4">No content yet. Start writing!</p>
            <button
              onClick={handleAddBlock}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add First Block
            </button>
          </div>
        </div>
      ) : (
        <>
          <BlockList blocks={page.blocks} pageId={page.id} onBlocksChange={loadPage} />

          {/* Add Block Button at Bottom */}
          <div className="max-w-4xl mx-auto px-8 py-4">
            <button
              onClick={handleAddBlock}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Click to add a block
            </button>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="max-w-4xl mx-auto px-8 py-8 border-t border-gray-200 mt-12">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50 transition"
        >
          {deleting ? 'Deleting...' : 'Delete Page'}
        </button>
      </div>
    </div>
  );
}
