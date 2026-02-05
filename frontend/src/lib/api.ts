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
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'code' | 'quote';
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
