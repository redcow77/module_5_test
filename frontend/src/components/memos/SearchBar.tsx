'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onReset: () => void;
}

export default function SearchBar({ onSearch, onReset }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      await onSearch(query.trim());
    } finally {
      setSearching(false);
    }
  }

  function handleClear() {
    setQuery('');
    onReset();
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search memos by title, content, tags..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={searching || !query.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {searching ? 'Searching...' : 'Search'}
      </button>
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Clear
        </button>
      )}
    </form>
  );
}
