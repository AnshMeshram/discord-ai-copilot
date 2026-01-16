import { supabase } from "../lib/supabase";
import { embedText } from "../../../lib/rag/embeddings";
import { retrieveSimilar } from "../../../lib/rag/retriever";

type MatchRow = {
  source: string;
  content: string;
};

export const ragService = {
  async getRetrievedContext(userMessage: string): Promise<string | undefined> {
    const embedding = await embedText(userMessage);
    if (!embedding) return undefined;

    // Prefer RPC if available; fallback to direct query via shared retriever
    try {
      const { data, error } = await supabase.rpc(
        "match_knowledge_chunks" as any,
        {
          query_embedding: embedding,
          match_count: 5,
          filter_source: null,
        }
      );
      if (error) throw error;
      const rows = (data as MatchRow[]) || [];
      if (!rows.length) return undefined;
      return rows
        .map((row, idx) => `${idx + 1}. [${row.source}] ${row.content}`)
        .join("\n");
    } catch {
      const matches = await retrieveSimilar(embedding, 5);
      if (!matches.length) return undefined;
      return matches
        .map(
          (m: MatchRow, idx: number) => `${idx + 1}. [${m.source}] ${m.content}`
        )
        .join("\n");
    }
  },
};
