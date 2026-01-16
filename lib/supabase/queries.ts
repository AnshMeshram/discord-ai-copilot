import { createServiceRoleClient } from "./server";
import type {
  SystemSettings,
  AllowedChannel,
  ConversationSummary,
} from "@/lib/types";

// Create service-role client ONCE
const supabasePromise = createServiceRoleClient();

const getSupabase = async () => {
  return await supabasePromise;
};

/* =====================================================
   SETTINGS
===================================================== */

export async function getSystemInstructions() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "system_instructions")
    .maybeSingle<{ value: SystemSettings["system_instructions"] }>();

  if (error) throw error;

  return (
    (data?.value as SystemSettings["system_instructions"]) ?? {
      text: "",
    }
  );
}

export async function updateSystemInstructions(instructions: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("settings").upsert(
    [
      {
        key: "system_instructions",
        value: { text: instructions },
        updated_at: new Date().toISOString(),
      },
    ] as any,
    { onConflict: "key" }
  );

  if (error) throw error;

  // Re-fetch for consistency
  return getSystemInstructions();
}

export async function getAIConfig() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "ai_config")
    .maybeSingle<{ value: SystemSettings["ai_config"] }>();

  if (error) throw error;

  return (
    (data?.value as SystemSettings["ai_config"]) ?? {
      provider: "gemini",
      model: "gemini-1.5-flash",
      temperature: 0.7,
      max_tokens: 512,
    }
  );
}

/* =====================================================
   ALLOWED CHANNELS
===================================================== */

export async function getAllowedChannels(
  serverId?: string
): Promise<AllowedChannel[]> {
  const supabase = await getSupabase();
  let query = supabase
    .from("allowed_channels")
    .select("*")
    .order("added_at", { ascending: false });
  if (serverId) query = query.eq("server_id", serverId);
  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

export async function isChannelAllowed(
  channelId: string,
  serverId?: string
): Promise<boolean> {
  const supabase = await getSupabase();
  // Prefer matching by both server and channel; fallback to channel-only for legacy rows
  let { data, error } = await supabase
    .from("allowed_channels")
    .select("id")
    .eq("channel_id", channelId)
    .eq(serverId ? "server_id" : "channel_id", serverId ?? channelId)
    .maybeSingle();

  if ((error && (error as any).code === "PGRST116") || !data) {
    ({ data, error } = await supabase
      .from("allowed_channels")
      .select("id")
      .eq("channel_id", channelId)
      .maybeSingle());
  }

  if (error) throw error;
  return Boolean(data);
}

export async function addAllowedChannel(
  channelId: string,
  channelName: string | undefined,
  serverId: string
): Promise<AllowedChannel> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("allowed_channels")
    .insert([
      {
        channel_id: channelId,
        channel_name: channelName ?? null,
        server_id: serverId,
      },
    ] as any)
    .select()
    .maybeSingle();

  // Insert succeeded
  if (data) return data as AllowedChannel;

  // Duplicate key → fetch existing
  if (error?.code === "23505") {
    const { data: existing, error: fetchError } = await supabase
      .from("allowed_channels")
      .select("*")
      .eq("channel_id", channelId)
      .eq("server_id", serverId)
      .maybeSingle();

    if (fetchError || !existing) {
      throw fetchError ?? new Error("Failed to fetch existing channel");
    }

    return existing as AllowedChannel;
  }

  if (error) throw error;
  throw new Error("Unexpected error while adding allowed channel");
}

export async function removeAllowedChannel(
  channelId: string,
  serverId?: string
) {
  const supabase = await getSupabase();
  let q = supabase
    .from("allowed_channels")
    .delete()
    .eq("channel_id", channelId);
  if (serverId) q = q.eq("server_id", serverId);
  const { error } = await q;

  if (error) throw error;
  return { success: true };
}

/* =====================================================
   CONVERSATION MEMORY (ROLLING SUMMARY)
===================================================== */

export async function getConversationSummary(
  channelId: string,
  serverId?: string
): Promise<ConversationSummary | null> {
  const supabase = await getSupabase();
  let { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("channel_id", channelId)
    .eq(serverId ? "server_id" : "channel_id", serverId ?? channelId)
    .maybeSingle();

  if ((error && (error as any).code === "PGRST116") || !data) {
    ({ data, error } = await supabase
      .from("summaries")
      .select("*")
      .eq("channel_id", channelId)
      .maybeSingle());
  }

  if (error) throw error;
  return data ?? null;
}

export async function updateConversationSummary(
  channelId: string,
  summary: string,
  serverId?: string
): Promise<ConversationSummary> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("summaries").upsert(
    [
      {
        channel_id: channelId,
        summary,
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        server_id: serverId ?? null,
      },
    ] as any,
    { onConflict: "channel_id" }
  );

  if (error) throw error;

  const { data, error: fetchError } = await supabase
    .from("summaries")
    .select("*")
    .eq("channel_id", channelId)
    .eq(serverId ? "server_id" : "channel_id", serverId ?? channelId)
    .single();

  if (fetchError || !data) {
    throw fetchError ?? new Error("Failed to fetch updated summary");
  }

  return data as ConversationSummary;
}

export async function resetConversationSummary(
  channelId: string,
  serverId?: string
) {
  const supabase = await getSupabase();
  let q = supabase.from("summaries").delete().eq("channel_id", channelId);
  if (serverId) q = q.eq("server_id", serverId);
  const { error } = await q;

  if (error) throw error;
  return { success: true };
}

/* =====================================================
   SUMMARIES (LIST ALL)
===================================================== */
export async function getAllSummaries() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as ConversationSummary[];
}

/* =====================================================
   MESSAGES (OPTIONAL / SHORT-LIVED)
===================================================== */

export async function saveMessage(
  channelId: string,
  messageId: string,
  userId: string,
  username: string | null,
  content: string,
  role: "user" | "assistant",
  serverId?: string
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        channel_id: channelId,
        message_id: messageId,
        user_id: userId,
        username,
        content,
        role,
        server_id: serverId ?? null,
      },
    ] as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentMessages(
  channelId: string,
  limit = 20,
  serverId?: string
) {
  const supabase = await getSupabase();
  let q = supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (serverId) q = q.eq("server_id", serverId);
  const { data, error } = await q;

  if (error) throw error;
  return (data ?? []).reverse();
}
