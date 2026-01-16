// Manage rolling conversation memory.
// Store only summarized context.
// Never store raw user messages.
// Keep memory compact and useful.
//
// WHY ROLLING SUMMARIES?
// 1. Token Efficiency: Summaries use 10-50 tokens vs 1000s for full history
// 2. Cost Reduction: Fewer input tokens = lower API costs
// 3. Performance: Faster processing with smaller context windows
// 4. Long Conversations: Handles unlimited conversation length without token limits
// 5. Focus: AI sees essential facts without noise from redundant exchanges

import { aiService } from "./aiService";
import { logger } from "../utils/logger";

export const memoryService = {
  /**
   * Generate rolling conversation summary using Gemini.
   *
   * This implements incremental summarization where each new exchange
   * updates the existing summary rather than re-reading all messages.
   *
   * Input:
   * - currentSummary: Existing summary (empty string if first summary)
   * - userMessage: Latest user message content
   * - botResponse: Latest bot response content
   *
   * Output:
   * - Plain text summary preserving key facts, decisions, and context
   * - Concise (2-4 sentences typical)
   * - Fallback to current summary on error (defensive)
   *
   * Rolling vs Full History:
   * - Scales infinitely (no token limit issues)
   * - 10-50 tokens vs 1000s for full chat history
   * - Preserves important context, drops trivial exchanges
   * - More cost-effective and faster
   */
  async updateSummary(
    currentSummary: string,
    userMessage: string,
    botResponse: string
  ): Promise<string> {
    try {
      // Defensive: if both messages empty, return existing summary
      if (!userMessage?.trim() && !botResponse?.trim()) {
        logger.warn(
          "Empty messages provided to updateSummary, keeping existing"
        );
        return currentSummary;
      }

      // Build optimized prompt for incremental summarization
      const summaryPrompt = `You are a precise conversation summarizer for a Discord AI assistant.

TASK: Update the existing summary with new information from the latest exchange. Be factual and concise.

EXISTING SUMMARY:
${currentSummary || "[No previous context]"}

NEW EXCHANGE:
User: ${userMessage}
Assistant: ${botResponse}

RULES:
1. Merge new facts into existing summary
2. Keep only important context (decisions, requests, solutions, preferences)
3. Drop greetings, confirmations, and trivial chat
4. Use 2-4 sentences maximum
5. Plain text only, no markdown or formatting
6. Be deterministic and factual

OUTPUT: Updated summary (plain text)`;

      const newSummary = await aiService.generateResponse(summaryPrompt);

      // Defensive: validate response
      if (
        !newSummary ||
        typeof newSummary !== "string" ||
        newSummary.trim().length === 0
      ) {
        logger.warn("Invalid AI summary response, keeping existing summary");
        return currentSummary;
      }

      // Defensive: prevent runaway summaries (should be concise)
      if (newSummary.length > 1000) {
        logger.warn(
          `Summary too long (${newSummary.length} chars), truncating`
        );
        return newSummary.substring(0, 997) + "...";
      }

      logger.info(`Summary updated: ${newSummary.length} chars`);
      return newSummary;
    } catch (error) {
      logger.error(`Error updating summary: ${error}`);
      // Defensive: always return existing summary on error
      return currentSummary;
    }
  },

  /**
   * Format conversation context for the prompt
   * Structures messages as a readable conversation history
   */
  formatContext(
    messages: Array<{ username: string; content: string }>
  ): string {
    if (messages.length === 0) {
      return "No previous messages in this channel.";
    }

    return messages.map((msg) => `${msg.username}: ${msg.content}`).join("\n");
  },

  /**
   * Trigger summary generation on a fixed interval of total messages.
   * Call this with the message_count AFTER incrementing for the latest logged message.
   */
  shouldGenerateSummary(messageCount: number): boolean {
    const SUMMARY_INTERVAL = 10; // total messages (user + assistant)
    return messageCount > 0 && messageCount % SUMMARY_INTERVAL === 0;
  },
};
