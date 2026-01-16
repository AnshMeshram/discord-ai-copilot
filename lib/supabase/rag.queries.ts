import { createServiceRoleClient } from "./server";
import { embedText } from "@/lib/rag/embeddings";
import { chunkText } from "@/lib/rag/chunker";

// The Supabase type file does not include the RAG tables/RPC yet, so we use a
// lightly typed client to avoid cascading type errors while still retaining
// runtime safety.
const supabasePromise = createServiceRoleClient();
const getSupabase = async () => (await supabasePromise) as any;

export type KnowledgeChunk = {
  id: string;
  source: string;
  source_id: string | null;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  similarity?: number;
};

export async function searchKnowledgeChunks(
  embedding: number[],
  matchCount = 5,
  filterSource?: string
): Promise<KnowledgeChunk[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: embedding,
    match_count: matchCount,
    filter_source: filterSource ?? null,
  });

  if (error) throw error;
  return (
    data?.map((row: any) => ({
      id: row.id,
      content: row.content,
      source: row.source,
      source_id: row.source_id,
      metadata: row.metadata || {},
      created_at: row.created_at ?? new Date().toISOString(),
      similarity: row.similarity,
    })) || []
  );
}

export async function listKnowledgeChunks(
  limit = 50
): Promise<KnowledgeChunk[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("knowledge_chunks")
    .select("id, source, source_id, content, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as KnowledgeChunk[]) || [];
}

export async function deleteKnowledgeChunk(id: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("knowledge_chunks")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return { success: true };
}

export type IngestResult = { inserted: number; skipped: number };

export async function ingestDocument(options: {
  source: string;
  sourceId?: string;
  content: string;
  chunkSize?: number;
}): Promise<IngestResult> {
  const supabase = await getSupabase();
  const chunkSize = options.chunkSize ?? 800;
  const chunks = chunkText(options.content, chunkSize);
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await embedText(chunk);
    if (!embedding) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("knowledge_chunks").upsert({
      source: options.source,
      source_id: options.sourceId ?? null,
      content: chunk,
      metadata: { chunk: i + 1, total_chunks: chunks.length },
      embedding,
    });

    if (error) throw error;
    inserted++;
  }

  return { inserted, skipped };
}
