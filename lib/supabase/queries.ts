import { createServiceRoleClient } from './server'
import type { SystemSettings, AllowedChannel, ConversationSummary } from '@/lib/types'

// Settings queries
export async function getSystemInstructions() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'system_instructions')
    .single()

  if (error) throw error
  return (data?.value as SystemSettings['system_instructions']) || { text: '' }
}

export async function updateSystemInstructions(instructions: string) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      key: 'system_instructions',
      value: { text: instructions },
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAIConfig() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'ai_config')
    .single()

  if (error) throw error
  return (data?.value as SystemSettings['ai_config']) || {
    model: 'llama-3.1-70b-versatile',
    temperature: 0.7,
    provider: 'groq',
  }
}

// Channel allow-list queries
export async function getAllowedChannels() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('allowed_channels')
    .select('*')
    .order('added_at', { ascending: false })

  if (error) throw error
  return data as AllowedChannel[]
}

export async function addAllowedChannel(channelId: string, channelName?: string) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('allowed_channels')
    .insert({
      channel_id: channelId,
      channel_name: channelName || null,
    })
    .select()
    .single()

  if (error) {
    // If duplicate, return existing
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('allowed_channels')
        .select('*')
        .eq('channel_id', channelId)
        .single()
      return existing as AllowedChannel
    }
    throw error
  }
  return data as AllowedChannel
}

export async function removeAllowedChannel(channelId: string) {
  const supabase = await createServiceRoleClient()
  const { error } = await supabase
    .from('allowed_channels')
    .delete()
    .eq('channel_id', channelId)

  if (error) throw error
  return { success: true }
}

export async function isChannelAllowed(channelId: string): Promise<boolean> {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('allowed_channels')
    .select('id')
    .eq('channel_id', channelId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return !!data
}

// Memory/Summary queries
export async function getConversationSummary(channelId: string) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('summaries')
    .select('*')
    .eq('channel_id', channelId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as ConversationSummary | null
}

export async function getAllSummaries() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('summaries')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as ConversationSummary[]
}

export async function updateConversationSummary(
  channelId: string,
  summary: string,
  messageCount: number
) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('summaries')
    .upsert({
      channel_id: channelId,
      summary,
      message_count: messageCount,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as ConversationSummary
}

export async function resetConversationSummary(channelId: string) {
  const supabase = await createServiceRoleClient()
  const { error } = await supabase
    .from('summaries')
    .delete()
    .eq('channel_id', channelId)

  if (error) throw error
  return { success: true }
}

// Message queries (for bot)
export async function saveMessage(
  channelId: string,
  messageId: string,
  userId: string,
  username: string | null,
  content: string
) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({
      channel_id: channelId,
      message_id: messageId,
      user_id: userId,
      username,
      content,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRecentMessages(channelId: string, limit: number = 20) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.reverse() // Return in chronological order
}
