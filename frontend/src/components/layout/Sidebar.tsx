'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Page, listPages, createPage } from '@/lib/api';
import ImportNotionModal from './ImportNotionModal';

export default function Sidebar() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      const data = await listPages();
      setPages(data);
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
      await loadPages();
      router.push(`/pages/${newPage.id}`);
    } catch (error) {
      console.error('Failed to create page:', error);
    } finally {
      setCreating(false);
    }
  }

  function toggleExpand(pageId: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }

  function handleImportSuccess(pageId: number, title: string) {
    // Show success toast
    setToastMessage(`Successfully imported "${title}"`);
    setTimeout(() => setToastMessage(''), 3000);

    // Reload pages and navigate
    loadPages();
    router.push(`/pages/${pageId}`);
  }

  // Build hierarchical tree
  function buildTree(pages: Page[]): Page[] {
    const map = new Map<number, Page>();
    const roots: Page[] = [];

    // Initialize all pages
    pages.forEach((page) => {
      map.set(page.id, { ...page, children: [] });
    });

    // Build tree
    pages.forEach((page) => {
      const node = map.get(page.id)!;
      if (page.parent_id === null) {
        roots.push(node);
      } else {
        const parent = map.get(page.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });

    return roots;
  }

  function renderPageTree(pages: Page[], depth = 0) {
    return pages.map((page) => {
      const hasChildren = page.children && page.children.length > 0;
      const isExpanded = expandedIds.has(page.id);
      const isActive = pathname === `/pages/${page.id}`;

      return (
        <div key={page.id}>
          <div
            className={`flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer group ${
              isActive ? 'bg-gray-100' : ''
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {hasChildren && (
              <button
                onClick={() => toggleExpand(page.id)}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded"
              >
                <span className="text-xs">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>
            )}
            {!hasChildren && <span className="w-4" />}
            <Link
              href={`/pages/${page.id}`}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <span className="text-sm">{page.icon || '📄'}</span>
              <span className="text-sm truncate">{page.title}</span>
            </Link>
          </div>
          {hasChildren && isExpanded && (
            <div>{renderPageTree(page.children!, depth + 1)}</div>
          )}
        </div>
      );
    });
  }

  const tree = buildTree(pages);

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">Notion Clone</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          </div>
        ) : (
          <div className="space-y-0.5">{renderPageTree(tree)}</div>
        )}
      </div>

      <div className="p-2 border-t border-gray-200 space-y-1">
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
        >
          <span>📥</span>
          <span>Import from Notion</span>
        </button>
        <button
          onClick={handleCreatePage}
          disabled={creating}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
        >
          <span>+</span>
          <span>{creating ? 'Creating...' : 'New Page'}</span>
        </button>
      </div>

      {/* Import Modal */}
      <ImportNotionModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
