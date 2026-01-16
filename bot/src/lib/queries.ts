import { supabase } from "./supabase";

export async function isChannelAllowed(
  channelId: string,
  serverId?: string
): Promise<boolean> {
  // We check only by channel_id because Discord channel IDs are globally unique.
  // We ignore server_id here to allow legacy rows (with null server_id) to still work.
  const { data, error } = await supabase
    .from("allowed_channels")
    .select("id")
    .eq("channel_id", channelId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
}

export async function getSystemInstructions(): Promise<{
  text: string;
  ai_config?: {
    model: string;
    provider: string;
    temperature: number;
  };
} | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "system_instructions")
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data?.value || null;
}

export async function getConversationSummary(
  channelId: string,
  serverId?: string
): Promise<{ summary: string; updated_at: string } | null> {
  // Relaxed check: match channel_id only, ignoring server_id to support legacy data
  const { data, error } = await supabase
    .from("summaries")
    .select("summary, updated_at")
    .eq("channel_id", channelId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateConversationSummary(
  channelId: string,
  summary: string,
  serverId?: string
): Promise<void> {
  const { error } = await supabase.from("summaries").upsert(
    {
      channel_id: channelId,
      summary,
      updated_at: new Date().toISOString(),
      server_id: serverId ?? null,
    },
    { onConflict: "channel_id" }
  );

  if (error) throw error;
}

export async function saveMessage(
  channelId: string,
  messageId: string,
  userId: string,
  username: string,
  content: string,
  role: "user" | "assistant",
  serverId?: string
): Promise<void> {
  const { error } = await supabase.from("messages").insert({
    channel_id: channelId,
    message_id: messageId,
    user_id: userId,
    username,
    content,
    role,
    server_id: serverId ?? null,
    created_at: new Date().toISOString(),
  });

  // Ignore duplicate message_id errors (already saved)
  if (error && error.code !== "23505") throw error;
}

export async function getRecentMessages(
  channelId: string,
  limit: number = 10,
  serverId?: string
): Promise<Array<{ username: string; content: string }>> {
  // Relaxed check: match channel_id only
  const { data, error } = await supabase
    .from("messages")
    .select("username, content")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data?.reverse() || [];
}

/**
 * Get current message count for a channel summary
 * Returns the total number of messages (user + assistant) counted for this channel
 */
export async function getMessageCount(
  channelId: string,
  serverId?: string
): Promise<number> {
  const { data, error } = await supabase
    .from("summaries")
    .select("message_count")
    .eq("channel_id", channelId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data?.message_count || 0;
}

/**
 * Increment message count for a channel
 * Called after saving user + assistant message pair
 * Returns the new message count
 */
export async function incrementMessageCount(
  channelId: string,
  increment: number = 2,
  serverId?: string
): Promise<number> {
  // First ensure the summary row exists (with message_count = 0 if new)
  const currentCount = await getMessageCount(channelId, serverId);
  const newCount = currentCount + increment;

  const { error } = await supabase.from("summaries").upsert(
    {
      channel_id: channelId,
      message_count: newCount,
      updated_at: new Date().toISOString(),
      server_id: serverId ?? null,
      // Provide default summary if inserting new row
      summary: `Conversation started. ${newCount} message(s) logged.`,
      last_message_at: new Date().toISOString(),
    },
    { onConflict: "channel_id" }
  );

  if (error) throw error;
  return newCount;
}
