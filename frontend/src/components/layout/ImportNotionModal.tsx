'use client';

import { useState, useEffect } from 'react';
import { importNotionPage, listPages, type ImportNotionRequest, type Page } from '@/lib/api';

interface ImportNotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pageId: number, title: string) => void;
}

export default function ImportNotionModal({ isOpen, onClose, onSuccess }: ImportNotionModalProps) {
  const [notionPageId, setNotionPageId] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Load pages for parent selection
  useEffect(() => {
    if (isOpen) {
      loadPages();
    }
  }, [isOpen]);

  const loadPages = async () => {
    try {
      const allPages = await listPages();
      setPages(allPages);
    } catch (err) {
      console.error('Failed to load pages:', err);
    }
  };

  const validateNotionPageId = (id: string): boolean => {
    // Notion page ID should be 32 characters (alphanumeric)
    const regex = /^[a-zA-Z0-9]{32}$/;
    return regex.test(id);
  };

  const handleNotionIdChange = (value: string) => {
    setNotionPageId(value);
    setValidationError('');
    setError('');

    if (value && !validateNotionPageId(value)) {
      setValidationError('Notion Page ID must be 32 alphanumeric characters');
    }
  };

  const handleImport = async () => {
    // Validate
    if (!notionPageId) {
      setValidationError('Please enter a Notion Page ID');
      return;
    }

    if (!validateNotionPageId(notionPageId)) {
      setValidationError('Invalid Notion Page ID format');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const request: ImportNotionRequest = {
        notion_page_id: notionPageId,
        parent_id: parentId,
      };

      const result = await importNotionPage(request);

      // Success
      onSuccess(result.page_id, result.title);
      handleClose();
    } catch (err: any) {
      // Handle specific error messages
      const errorMessage = err.message || 'Failed to import page';

      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError('Notion API key not configured. Please set NOTION_API_KEY in backend .env file.');
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setError('Page not found. Please check the Page ID and ensure the Notion Integration has access.');
      } else if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
        setError('Failed to connect to Notion. Please check your internet connection.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNotionPageId('');
    setParentId(null);
    setError('');
    setValidationError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Import from Notion</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Notion Page ID Input */}
          <div>
            <label htmlFor="notionPageId" className="block text-sm font-medium text-gray-700 mb-2">
              Notion Page ID *
            </label>
            <input
              id="notionPageId"
              type="text"
              value={notionPageId}
              onChange={(e) => handleNotionIdChange(e.target.value)}
              placeholder="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                validationError ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
              maxLength={32}
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-600">{validationError}</p>
            )}
          </div>

          {/* Parent Page Selection */}
          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
              Parent Page (Optional)
            </label>
            <select
              id="parentId"
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">No parent (top level)</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.icon} {page.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose where to import this page
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
              {error.includes('Notion Integration') && (
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                >
                  Configure Notion Integration →
                </a>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">How to get Notion Page ID:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Open the page in Notion</li>
              <li>Click <strong>Share</strong> → <strong>Copy link</strong></li>
              <li>Extract the 32-character ID from the URL</li>
            </ol>
            <div className="mt-3 p-2 bg-white border border-gray-200 rounded font-mono text-xs text-gray-700">
              <div className="text-gray-500">Example URL:</div>
              <div className="break-all">https://notion.so/Page-Title-<span className="bg-yellow-100">a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6</span></div>
              <div className="mt-1 text-gray-500">Page ID:</div>
              <div className="bg-yellow-100">a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || !notionPageId || !!validationError}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Importing...
              </>
            ) : (
              <>
                📥 Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
