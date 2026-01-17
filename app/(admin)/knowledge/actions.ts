"use server";

import { revalidatePath } from "next/cache";

// RAG removed: ingestion and chunk deletion are no-ops.

export async function ingestKnowledge(formData: FormData): Promise<void> {
  const source = (formData.get("source") as string)?.trim() || "docs";
  const content = (formData.get("content") as string)?.trim();
  const chunkSizeStr = (formData.get("chunkSize") as string) || "800";
  const chunkSize = Number(chunkSizeStr) || 800;

  if (!content) {
    return;
  }

  try {
    // RAG disabled — no-op ingest. Keep behavior silent and revalidate.
    revalidatePath("/knowledge");
    console.log(`Ingest disabled; received ${content?.slice(0, 60)}...`);
  } catch (error) {
    console.error(error);
  }
}

export async function deleteChunk(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) return;

  try {
    // RAG disabled — pretend deletion succeeded so UI remains stable.
    revalidatePath("/knowledge");
  } catch (error) {
    console.error(error);
  }
}
