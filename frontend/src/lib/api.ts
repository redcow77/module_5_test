// API functions for Notion clone

export interface Page {
  id: number;
  title: string;
  icon: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  children?: Page[];
}

export interface Block {
  id: number;
  page_id: number;
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'bullet_list' | 'numbered_list' | 'todo' | 'code' | 'quote' | 'divider';
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface PageWithBlocks extends Page {
  blocks: Block[];
}

export interface CreatePageRequest {
  title: string;
  icon?: string | null;
  parent_id?: number | null;
}

export interface UpdatePageRequest {
  title?: string;
  icon?: string | null;
  parent_id?: number | null;
}

export interface CreateBlockRequest {
  page_id: number;
  type: Block['type'];
  content: string;
  order: number;
}

export interface UpdateBlockRequest {
  type?: Block['type'];
  content?: string;
  order?: number;
}

export interface ReorderBlocksRequest {
  block_orders: { id: number; order: number }[];
}

export interface ImportNotionRequest {
  notion_page_id: string;
  parent_id?: number | null;
}

export interface ImportNotionResponse {
  page_id: number;
  blocks_count: number;
  notion_page_id: string;
  title: string;
  icon?: string;
}

// Error handling helper
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// List all pages
export async function listPages(): Promise<Page[]> {
  const response = await fetch('/api/pages/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<Page[]>(response);
}

// Get a single page with blocks
export async function getPage(id: number): Promise<PageWithBlocks> {
  const response = await fetch(`/api/pages/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<PageWithBlocks>(response);
}

// Create a new page
export async function createPage(data: CreatePageRequest): Promise<Page> {
  const response = await fetch('/api/pages/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Page>(response);
}

// Update a page
export async function updatePage(
  id: number,
  data: UpdatePageRequest
): Promise<Page> {
  const response = await fetch(`/api/pages/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Page>(response);
}

// Delete a page
export async function deletePage(id: number): Promise<void> {
  const response = await fetch(`/api/pages/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
}

// Create a new block
export async function createBlock(data: CreateBlockRequest): Promise<Block> {
  const response = await fetch('/api/blocks/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Block>(response);
}

// Update a block
export async function updateBlock(
  id: number,
  data: UpdateBlockRequest
): Promise<Block> {
  const response = await fetch(`/api/blocks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Block>(response);
}

// Delete a block
export async function deleteBlock(id: number): Promise<void> {
  const response = await fetch(`/api/blocks/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
}

// Reorder blocks
export async function reorderBlocks(
  data: ReorderBlocksRequest
): Promise<Block[]> {
  const response = await fetch('/api/blocks/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Block[]>(response);
}

// Import page from Notion
export async function importNotionPage(
  request: ImportNotionRequest
): Promise<ImportNotionResponse> {
  const response = await fetch('/api/mcp/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<ImportNotionResponse>(response);
}

// ============================================
// Memo API
// ============================================

export interface Memo {
  id: number;
  title: string;
  content: string;
  ai_summary: string | null;
  tags: string[] | null;
  user_id: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateMemoRequest {
  title?: string;
  content: string;
}

export interface UpdateMemoRequest {
  title?: string;
  content?: string;
}

// List all memos
export async function listMemos(): Promise<Memo[]> {
  const response = await fetch('/api/memos/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<Memo[]>(response);
}

// Search memos by keyword
export async function searchMemos(query: string): Promise<Memo[]> {
  const response = await fetch(`/api/memos/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<Memo[]>(response);
}

// Get a single memo
export async function getMemo(id: number): Promise<Memo> {
  const response = await fetch(`/api/memos/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<Memo>(response);
}

// Create a new memo
export async function createMemo(data: CreateMemoRequest): Promise<Memo> {
  const response = await fetch('/api/memos/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Memo>(response);
}

// Update a memo
export async function updateMemo(
  id: number,
  data: UpdateMemoRequest
): Promise<Memo> {
  const response = await fetch(`/api/memos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Memo>(response);
}

// Delete a memo
export async function deleteMemo(id: number): Promise<void> {
  const response = await fetch(`/api/memos/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
}

// Regenerate AI summary and tags for a memo
export async function regenerateAI(id: number): Promise<Memo> {
  const response = await fetch(`/api/memos/${id}/regenerate-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<Memo>(response);
}
