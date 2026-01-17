// app/(admin)/knowledge/page.tsx

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-text">Knowledge Base</h1>
        <p className="mt-1 text-sm text-text-muted">
          Knowledge ingestion is currently disabled.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text">Status</h2>
        <p className="mt-2 text-sm text-text-muted">
          Retrieval-augmented knowledge is not enabled in this deployment.
        </p>
        <p className="mt-1 text-sm text-text-muted">
          This section is reserved for future enhancements.
        </p>
      </section>
    </div>
  );
}
