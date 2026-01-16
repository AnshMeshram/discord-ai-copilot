export function chunkText(text: string, size = 800): string[] {
  const clean = text?.trim();
  if (!clean) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + size, clean.length);
    const slice = clean.slice(start, end).trim();
    if (slice) chunks.push(slice);
    start = end;
  }
  return chunks;
}
