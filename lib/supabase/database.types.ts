// This file will be auto-generated from Supabase schema
// For now, we'll define basic types manually

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      allowed_channels: {
        Row: {
          id: string
          channel_id: string
          channel_name: string | null
          added_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          channel_name?: string | null
          added_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          channel_name?: string | null
          added_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          channel_id: string
          message_id: string
          user_id: string
          username: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          message_id: string
          user_id: string
          username?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          message_id?: string
          user_id?: string
          username?: string | null
          content?: string
          created_at?: string
        }
      }
      summaries: {
        Row: {
          id: string
          channel_id: string
          summary: string
          message_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          summary: string
          message_count?: number
          updated_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          summary?: string
          message_count?: number
          updated_at?: string
        }
      }
    }
  }
}
