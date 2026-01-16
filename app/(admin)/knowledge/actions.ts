"use server";

import { revalidatePath } from "next/cache";
import {
  ingestDocument,
  deleteKnowledgeChunk,
} from "@/lib/supabase/rag.queries";

export async function ingestKnowledge(formData: FormData): Promise<void> {
  const source = (formData.get("source") as string)?.trim() || "docs";
  const content = (formData.get("content") as string)?.trim();
  const chunkSizeStr = (formData.get("chunkSize") as string) || "800";
  const chunkSize = Number(chunkSizeStr) || 800;

  if (!content) {
    return;
  }

  try {
    const result = await ingestDocument({ source, content, chunkSize });
    revalidatePath("/knowledge");
    // Optionally hook a toast via client action in the future
    console.log(
      `Ingested ${result.inserted} chunk(s). Skipped ${result.skipped}.`
    );
  } catch (error) {
    console.error(error);
  }
}

export async function deleteChunk(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) return;

  try {
    await deleteKnowledgeChunk(id);
    revalidatePath("/knowledge");
  } catch (error) {
    console.error(error);
  }
}
