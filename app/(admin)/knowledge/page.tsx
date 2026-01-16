import { listKnowledgeChunks } from "@/lib/supabase/rag.queries";
import { ingestKnowledge, deleteChunk } from "./actions";
import { Button } from "@/components/ui/button";
import { StatusBanner } from "@/app/(admin)/components/banners/StatusBanner";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const chunks = await listKnowledgeChunks(50);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text">Knowledge Base</h1>
          <p className="text-text-muted">
            Ingest reference docs to ground responses via retrieval.
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <h2 className="text-lg font-semibold text-text">Ingest Document</h2>
        <p className="mt-1 text-sm text-text-muted">
          Paste markdown or text. It will be chunked and embedded.
        </p>
        <form action={ingestKnowledge} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr,200px,140px]">
            <textarea
              name="content"
              required
              rows={6}
              className="min-h-[180px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-[var(--focus)] sm:col-span-2"
              placeholder="Paste docs or FAQ text here"
            />
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text">
                Source
              </label>
              <input
                name="source"
                defaultValue="docs"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              />
              <label className="block text-xs font-semibold text-text">
                Chunk size
              </label>
              <input
                name="chunkSize"
                defaultValue="800"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              />
              <Button type="submit" variant="primary" className="w-full">
                Ingest
              </Button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-text">Chunks</h2>
            <p className="text-sm text-text-muted">Most recent 50</p>
          </div>
          <span className="text-sm text-text-muted">{chunks.length} items</span>
        </div>

        {chunks.length === 0 ? (
          <StatusBanner tone="info" message="No knowledge chunks yet." />
        ) : (
          <div className="mt-4 space-y-3">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="rounded-lg border border-border bg-surfaceMuted p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-text">
                    {chunk.source}
                    {chunk.source_id ? ` · ${chunk.source_id}` : ""}
                  </div>
                  <form action={deleteChunk}>
                    <input type="hidden" name="id" value={chunk.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Delete
                    </Button>
                  </form>
                </div>
                <p className="mt-2 text-sm text-text-muted line-clamp-3">
                  {chunk.content}
                </p>
                <p className="mt-2 text-[11px] uppercase text-text-muted">
                  {chunk.created_at}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
