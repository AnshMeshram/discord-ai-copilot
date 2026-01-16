/**
 * Prompt Context Builder
 *
 * Constructs AI prompts with optimal token efficiency:
 * - System instructions (defines behavior)
 * - Rolling summary (long-term context, ~30-50 tokens)
 * - Recent messages (immediate context, ~100-200 tokens)
 * - User message (current request)
 *
 * Total context: ~400-500 tokens (vs 3000+ for full history)
 * Remaining budget: 3500-3700 tokens for response
 */

export interface PromptContext {
  instructions: string;
  summary: string;
  recentMessages: string;
  userMessage: string;
}

/**
 * Rough token estimation for a text string
 * Uses simple heuristic: ~1 token per 4 characters
 * Actual tokenization varies by model, but this provides estimates
 */
export function estimateTokens(text: string): number {
  // Average: 1.3 tokens per word, ~4-5 chars per word
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount * 1.3);
}

/**
 * Truncate text to approximate token limit
 * Defensive: ensures context doesn't bloat
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  if (estimateTokens(text) <= maxTokens) {
    return text;
  }

  // Binary search for right length
  let truncated = text;
  while (estimateTokens(truncated) > maxTokens && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }

  return truncated.trim() + (truncated.length < text.length ? "..." : "");
}

/**
 * Build deterministic AI prompt with token awareness
 *
 * Structure (in order of importance):
 * 1. System Instructions - defines AI personality and guardrails
 * 2. Conversation Summary - long-term context (rolling, not full history)
 * 3. Recent Messages - immediate conversational context
 * 4. User Message - what to respond to now
 *
 * Token Budget (~4000 total):
 * - Instructions: ~50-100 tokens
 * - Summary: ~30-50 tokens (vs 500+ for full history)
 * - Recent Messages: ~100-200 tokens
 * - User Message: ~50 tokens
 * - Overhead/Structure: ~100 tokens
 * Total Used: ~400-500 tokens
 * Available for Response: ~3500 tokens
 */
export function buildContextPrompt(context: PromptContext): string {
  // Validate and sanitize inputs (defensive)
  const instructions =
    context.instructions?.trim() ||
    "You are a helpful Discord AI assistant. Be friendly, concise, and accurate.";
  const summary =
    context.summary?.trim() ||
    "No previous context. This is the start of the conversation.";
  const recentMessages =
    context.recentMessages?.trim() || "No recent messages in history.";
  const userMessage = context.userMessage?.trim() || "(Empty user message)";

  // Defensive: Truncate excessively long context
  // Summary should stay concise (max 300 chars, ~75 tokens)
  const truncatedSummary = truncateToTokenLimit(summary, 75);
  // Recent messages: max 500 chars, ~150 tokens
  const truncatedRecentMessages = truncateToTokenLimit(recentMessages, 150);

  // Build prompt with clear hierarchical structure
  const prompt = `You are a helpful Discord AI assistant. Respond concisely and naturally.

═══════════════════════════════════════════════════════════════

SYSTEM INSTRUCTIONS:
${instructions}

═══════════════════════════════════════════════════════════════

CONVERSATION CONTEXT:

Long-term Summary (rolling context to save tokens):
${truncatedSummary}

Recent Messages (last few turns for immediate context):
${truncatedRecentMessages}

═══════════════════════════════════════════════════════════════

USER'S CURRENT MESSAGE:
${userMessage}

═══════════════════════════════════════════════════════════════

Respond directly to the user's message. Be helpful, accurate, and concise.
Keep responses under 2000 characters (Discord message limit).`;

  return prompt;
}

/**
 * Log prompt statistics for debugging
 */
export function logPromptStats(prompt: string, context: PromptContext): void {
  const tokens = estimateTokens(prompt);
  const summaryTokens = estimateTokens(context.summary);
  const messageTokens = estimateTokens(context.recentMessages);

  console.log(`
📊 Prompt Statistics:
  - Total tokens: ~${tokens}
  - Instructions: ~${estimateTokens(context.instructions)}
  - Summary: ~${summaryTokens} tokens
  - Recent messages: ~${messageTokens} tokens
  - User message: ~${estimateTokens(context.userMessage)}
  - Budget remaining: ~${4096 - tokens}
  `);
}
