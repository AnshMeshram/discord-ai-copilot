// RAG supabase queries removed. These functions previously handled knowledge
// chunk ingestion and semantic search via Supabase. They have been deleted to
// remove RAG functionality. Any calls to these functions should be removed or
// replaced with alternative logic.

export type IngestResult = {
  inserted: number;
  skipped: number;
};

export type KnowledgeChunk = {
  id: string;
  source?: string;
  source_id?: string;
  content?: string;
  created_at?: string;
  [key: string]: any;
};

export async function searchKnowledgeChunks(
  _query: string,
): Promise<KnowledgeChunk[]> {
  // RAG removed: return empty result set so UI can render normally.
  return [];
}

export async function listKnowledgeChunks(
  _sourceOrLimit?: string | number,
): Promise<KnowledgeChunk[]> {
  // RAG removed: return empty list to avoid breaking admin pages.
  // Accept either a source string or a numeric limit used by callers.
  return [];
}

export async function deleteKnowledgeChunk(_id: string): Promise<void> {
  // No-op: RAG backend removed. Silently succeed to keep admin flows stable.
  return;
}

export async function ingestDocument({
  source,
  content,
  chunkSize,
}: {
  source: string;
  content: string;
  chunkSize?: number;
}): Promise<IngestResult> {
  // No-op ingestion: return zeros so call sites receive a valid response.
  return { inserted: 0, skipped: 0 };
}
