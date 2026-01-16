export type PromptContext = {
  instructions: string;
  summary: string;
  recentMessages: string;
  userMessage: string;
  retrieved?: string;
};

export function buildPrompt(ctx: PromptContext): string {
  const instructions =
    ctx.instructions?.trim() || "You are a helpful Discord assistant.";
  const summary = ctx.summary?.trim() || "No previous context.";
  const recent = ctx.recentMessages?.trim() || "No recent messages.";
  const user = ctx.userMessage?.trim() || "";
  const retrieved = ctx.retrieved?.trim();

  return `You are a helpful Discord AI assistant. Respond concisely and naturally.

═══════════════════════════════════════════════════════════════

SYSTEM INSTRUCTIONS:
${instructions}

═══════════════════════════════════════════════════════════════

CONVERSATION CONTEXT:

Long-term Summary (rolling context to save tokens):
${summary}

Recent Messages (last few turns for immediate context):
${recent}

Retrieved Knowledge (semantic search results):
${retrieved || "No retrieved knowledge for this query."}

═══════════════════════════════════════════════════════════════

USER'S CURRENT MESSAGE:
${user}

═══════════════════════════════════════════════════════════════

Respond directly to the user's message. Be helpful, accurate, and concise.
Keep responses under 2000 characters (Discord message limit).`;
}
