export const memoryCopy = {
  activeBadge: "Memory system active",
  emptyTitle: "No conversation summaries yet",
  emptyDescription:
    "Start chatting in an allowed channel to generate rolling summaries. They appear after the first 10 messages and refresh every 10 to keep context lean.",
  resetDescription: (channelId?: string) =>
    `This will permanently clear the rolling summary for ${
      channelId || "this channel"
    }. The bot will start fresh on the next message.`,
};
