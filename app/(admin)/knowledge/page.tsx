import { EmptyState } from "@/app/(admin)/components/empty-states/EmptyState";
import { Button } from "@/components/ui/button";

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-text">Knowledge Base</h1>
        <p className="mt-1 text-sm text-text-muted">
          Retrieval-augmented ingestion is disabled for this deployment.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Status</h2>
          <p className="mt-2 text-sm text-text-muted">
            RAG (retrieval-augmented generation) features have been removed from
            this build. Ingestion and indexed retrieval are not available.
          </p>
          <p className="mt-4 text-sm text-text-muted">
            If you may like to enable knowledge ingestion, re-enable the RAG
            workflow and provide a server-side vector store.
          </p>
        </div>

        <EmptyState
          title="Ingestion disabled"
          description={
            "Knowledge ingestion is not enabled. You can still store messages and summaries via the bot, but document ingestion is disabled in this deployment."
          }
          primaryAction={
            <Button variant="primary" disabled>
              Ingest documents
            </Button>
          }
          secondaryAction={
            <a
              className="text-sm text-primary hover:underline"
              href="/README.md"
            >
              Learn how to enable
            </a>
          }
        />
      </section>
    </div>
  );
}
