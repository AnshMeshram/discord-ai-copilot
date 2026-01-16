import "dotenv/config";

// Implement a Discord bot message handler that:
// - Ignores bot messages
// - Checks if the channel ID is allow-listed (from Supabase)
// - Responds only if the message is valid
// - Delegates AI response generation to a separate function
// Fetch allowed Discord channel IDs from Supabase.
// Cache them in memory and refresh periodically.
// Return true only if the current channel is allowed.
// Retrieve the rolling conversation summary from Supabase.
// If no summary exists, return an empty string.
// This summary will be injected into the AI prompt.

import { Client, GatewayIntentBits, ChannelType } from "discord.js";
import { messageHandler } from "./handlers/messageHandler";
import { logger } from "./utils/logger";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once("ready", () => {
  logger.info(`✅ Bot logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    logger.info(
      `event:messageCreate channel=${message.channelId} type=${
        message.channel.type
      } authorBot=${message.author.bot} contentLen=${
        message.content?.length ?? 0
      }`
    );
    // Ignore bot messages
    if (message.author.bot) return;

    // Ignore DMs for now (optional: handle later)
    if (message.channel.type === ChannelType.DM) return;

    // Handle message
    await messageHandler(message);
  } catch (error) {
    logger.error("Message handler error:", error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
