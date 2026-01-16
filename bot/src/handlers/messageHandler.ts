import { Message } from "discord.js";
import { databaseService } from "../services/databaseService";
import { aiService } from "../services/aiService";
import { memoryService } from "../services/memoryService";
import { ragService } from "../services/ragService";
import { logger } from "../utils/logger";
import { buildPrompt } from "../../../lib/rag/prompt";

export async function messageHandler(message: Message): Promise<void> {
  // Ignore bot messages and empty content
  if (message.author.bot || !message.content.trim()) {
    return;
  }

  const channelId = message.channelId;
  const isThread = (message.channel as any).isThread?.() ?? false;
  const parentId: string | null = isThread
    ? (message.channel as any).parentId ?? null
    : null;
  const userId = message.author.id;
  const username = message.author.username;
  const content = message.content;

  try {
    // Step 1: Check if channel is allowed (support threads via parent channel)
    const serverId = (message.guild?.id ?? null) as string | null;
    const allowedDirect = await databaseService.isChannelAllowed(
      channelId,
      serverId ?? undefined
    );
    const allowedParent = parentId
      ? await databaseService.isChannelAllowed(parentId, serverId ?? undefined)
      : false;
    const baseChannelId = allowedDirect
      ? channelId
      : allowedParent && parentId
      ? parentId
      : channelId;

    if (!allowedDirect && !allowedParent) {
      logger.info(
        `Message in non-allowed channel. channel=${channelId} isThread=${isThread} parent=${
          parentId ?? "none"
        }`
      );
      return;
    }

    // Step 2: Fetch instructions and summary
    logger.info(
      `Processing message from ${username} in channel=${channelId} base=${baseChannelId} isThread=${isThread}`
    );
    const instructions = await databaseService.getSystemInstructions();
    const summary = await databaseService.getConversationSummary(
      baseChannelId,
      serverId ?? undefined
    );

    // Step 3: Fetch recent messages for context
    const recentMessages = await databaseService.getRecentMessages(
      baseChannelId,
      5,
      serverId ?? undefined
    );
    const messagesText = memoryService.formatContext(recentMessages);

    // Step 4: Build prompt with retrieved knowledge (best-effort)
    const retrieved = await ragService.getRetrievedContext(content);

    const prompt = buildPrompt({
      instructions: instructions.text,
      summary: summary?.summary || "No previous context.",
      recentMessages: messagesText,
      userMessage: content,
      retrieved,
    });

    // Step 5: Show typing indicator
    try {
      if (
        message.channel.isDMBased?.() === false &&
        message.channel.isTextBased?.()
      ) {
        const typingFn = (message.channel as any).sendTyping;
        if (typeof typingFn === "function") {
          await typingFn.call(message.channel);
        }
      }
    } catch {
      // Ignore typing errors
    }

    // Step 6: Call AI
    const response = await aiService.generateResponse(prompt);
    if (!response) {
      logger.error("AI service returned null response");
      await message.reply(
        "Sorry, I encountered an error while generating a response."
      );
      return;
    }

    // Step 7: Reply in Discord (split long messages)
    const chunks = splitMessage(response, 2000);
    const sentReplies = [] as Array<Message>;
    for (const chunk of chunks) {
      const reply = await message.reply(chunk);
      sentReplies.push(reply);
    }

    logger.success(`Replied in channel=${channelId} base=${baseChannelId}`);

    // Step 8: Save messages (non-blocking) and conditionally update summary
    // Save user message
    databaseService
      .saveMessage(
        baseChannelId,
        message.id,
        userId,
        username,
        content,
        "user",
        serverId ?? undefined
      )
      .catch((err) =>
        logger.error(
          `Failed to log user message: ${
            err instanceof Error ? err.message : JSON.stringify(err)
          }`
        )
      );

    // Save bot reply (join chunks for storage)
    const botMessageId = sentReplies[0]?.id ?? `${message.id}-bot`;
    const botUserId = message.client.user?.id ?? "bot";
    const botUsername = message.client.user?.username ?? "bot";
    const botContent = chunks.join("\n");

    databaseService
      .saveMessage(
        baseChannelId,
        botMessageId,
        botUserId,
        botUsername,
        botContent,
        "assistant",
        serverId ?? undefined
      )
      .catch((err) =>
        logger.error(
          `Failed to log bot message: ${
            err instanceof Error ? err.message : JSON.stringify(err)
          }`
        )
      );

    // Step 9: Increment message count and conditionally update summary (non-blocking)
    // Fire-and-forget: does not block bot operation
    (async () => {
      try {
        // Increment by 2: one user message + one assistant message
        const newMessageCount = await databaseService.incrementMessageCount(
          baseChannelId,
          2,
          serverId ?? undefined
        );

        logger.info(
          `Message count incremented to ${newMessageCount} for channel=${baseChannelId}`
        );

        // Check if we should generate summary (every 10 messages)
        if (memoryService.shouldGenerateSummary(newMessageCount)) {
          logger.info(
            `Summary trigger activated at message_count=${newMessageCount}`
          );

          // Generate and store new summary
          const updatedSummary = await memoryService.updateSummary(
            summary?.summary || "",
            content,
            response
          );

          await databaseService.updateSummary(
            baseChannelId,
            updatedSummary,
            serverId ?? undefined
          );

          logger.success(
            `Summary updated and stored at message_count=${newMessageCount}`
          );
        } else {
          logger.info(
            `Summary trigger not yet reached: ${newMessageCount} messages (next at 10, 20, 30...)`
          );
        }
      } catch (err) {
        // Defensive: log error but do not propagate
        // This ensures message persistence doesn't affect bot uptime
        logger.error(
          `Failed to update summary or message count: ${
            err instanceof Error ? err.message : JSON.stringify(err)
          }`
        );
      }
    })();
  } catch (error) {
    logger.error(
      `Error handling message: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );
    try {
      await message.reply("An error occurred. Please try again later.");
    } catch (err) {
      logger.error(
        `Failed to send error reply: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
}

// Helper: Split long messages
function splitMessage(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const line of text.split("\n")) {
    if ((current + line).length > maxLength) {
      if (current) chunks.push(current);
      current = line;
    } else {
      current = current ? current + "\n" + line : line;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}
