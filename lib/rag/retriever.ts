import { searchKnowledgeChunks } from "@/lib/supabase/rag.queries";

export async function retrieveSimilar(
  embedding: number[],
  matchCount = 5,
  filterSource?: string
) {
  if (!embedding?.length) return [];
  return searchKnowledgeChunks(embedding, matchCount, filterSource);
}
