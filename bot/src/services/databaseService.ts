import * as queries from "../lib/queries";

/**
 * Bot database service - delegates to bot-specific queries
 * Provides interface for bot message processing and memory management
 */
export const databaseService = {
  /**
   * Check if a Discord channel is in the allow-list
   */
  async isChannelAllowed(
    channelId: string,
    serverId?: string
  ): Promise<boolean> {
    return queries.isChannelAllowed(channelId, serverId);
  },

  /**
   * Get system instructions and AI config
   */
  async getSystemInstructions(): Promise<{
    text: string;
    aiConfig: {
      model: string;
      provider: string;
      temperature: number;
    };
  }> {
    try {
      const instructions = await queries.getSystemInstructions();
      return {
        text: instructions?.text || "You are a helpful Discord assistant.",
        aiConfig: {
          model: "gemini-1.5-flash",
          provider: "gemini",
          temperature: 0.7,
        },
      };
    } catch (error) {
      console.error("Failed to get system instructions:", error);
      return {
        text: "You are a helpful Discord assistant.",
        aiConfig: {
          model: "gemini-1.5-flash",
          provider: "gemini",
          temperature: 0.7,
        },
      };
    }
  },

  /**
   * Get conversation summary for a channel
   */
  async getConversationSummary(
    channelId: string,
    serverId?: string
  ): Promise<{
    summary: string;
    updated_at: string;
  } | null> {
    return queries.getConversationSummary(channelId, serverId);
  },

  /**
   * Update or create conversation summary
   */
  async updateSummary(
    channelId: string,
    summary: string,
    serverId?: string
  ): Promise<void> {
    return queries.updateConversationSummary(channelId, summary, serverId);
  },

  /**
   * Save message to conversation history
   */
  async saveMessage(
    channelId: string,
    messageId: string,
    userId: string,
    username: string,
    content: string,
    role: "user" | "assistant",
    serverId?: string
  ): Promise<void> {
    return queries.saveMessage(
      channelId,
      messageId,
      userId,
      username,
      content,
      role,
      serverId
    );
  },

  /**
   * Get recent messages from a channel (for context)
   */
  async getRecentMessages(
    channelId: string,
    limit: number = 10,
    serverId?: string
  ): Promise<
    Array<{
      username: string;
      content: string;
    }>
  > {
    return queries.getRecentMessages(channelId, limit, serverId);
  },

  /**
   * Get current message count for a channel summary
   * Used to determine when to trigger summary generation
   */
  async getMessageCount(channelId: string, serverId?: string): Promise<number> {
    return queries.getMessageCount(channelId, serverId);
  },

  /**
   * Increment message count after saving messages
   * Called after user + assistant messages are logged
   * Increments by 2 (one user, one assistant)
   */
  async incrementMessageCount(
    channelId: string,
    increment: number = 2,
    serverId?: string
  ): Promise<number> {
    return queries.incrementMessageCount(channelId, increment, serverId);
  },
};
