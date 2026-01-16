# Supabase Database Setup

## Quick Setup Guide

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in (GitHub recommended)
3. Click "New Project"
4. Fill in:
   - **Name:** discord-ai-copilot (or your choice)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize

### Step 2: Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `schema.sql` file
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Step 3: Get Your Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. Copy these values:
   - **Project URL** → `https://zixtukcgtvuuruvrtbai.supabase.co`
   - **anon public** key → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHR1a2NndHZ1dXJ1dnJ0YmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjQ2MTYsImV4cCI6MjA4MzgwMDYxNn0.BlfjXLfuhuFKNUtzg4a5ph2wTo_VM49gH4YFGvAkeHg`
   - **service_role** key → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHR1a2NndHZ1dXJ1dnJ0YmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIyNDYxNiwiZXhwIjoyMDgzODAwNjE2fQ.M1rtbFU9cbkBeJwWjoPvMGM4or6ELvccKmD2OvJqSLE` (keep secret!)

### Step 4: Enable Authentication

1. Go to **Authentication** in sidebar
2. Click **Settings**
3. Under **Email Auth**, make sure it's enabled
4. (Optional for MVP) Disable **Confirm email** to skip email verification

### Step 5: Create Admin User (For Testing)

1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter:
   - **Email:** admin@test.com (or your email)
   - **Password:** Choose a password
   - **Auto Confirm User:** ✅ Check this
4. Click **Create user**
5. Save these credentials for handoff!

### Step 6: Verify Tables Created

1. Go to **Table Editor** in sidebar
2. You should see these tables:
   - ✅ `settings`
   - ✅ `allowed_channels`
   - ✅ `messages`
   - ✅ `summaries`

### Step 7: Add Environment Variables

Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Provider (Groq - Free)
GROQ_API_KEY=your_groq_api_key
AI_PROVIDER=groq
AI_MODEL=llama-3.1-70b-versatile

# Discord
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_BOT_TOKEN=your_discord_bot_token
```

### Step 8: Test Connection

1. Restart your dev server: `npm run dev`
2. Visit: http://localhost:3000/api/health
3. Visit: http://localhost:3000/api/settings
4. Should return JSON (even if empty, means connection works!)

---

## Database Schema Overview

### Tables

1. **settings** - System instructions and AI config
2. **allowed_channels** - Discord channels where bot can respond
3. **messages** - Conversation messages (for memory)
4. **summaries** - Rolling conversation summaries per channel

### Default Data

After running schema, you'll have:

- Default system instructions
- Default AI config (Groq, llama-3.1-70b-versatile)

---

## Troubleshooting

### "relation does not exist"

- Make sure you ran the entire `schema.sql` file
- Check Table Editor to see if tables exist

### "Invalid API key"

- Double-check your environment variables
- Make sure you copied the full key (they're long!)

### "Connection refused"

- Check your Supabase project is active (not paused)
- Verify the URL is correct

### API returns 500 error

- Check server logs in terminal
- Verify `.env.local` file exists and has correct values
- Make sure Supabase project is not paused

---

## Next Steps

After database setup:

- ✅ Phase 2 Complete
- ⏭️ Phase 3: Admin Auth & API (will use Supabase Auth)
- ⏭️ Phase 4: Admin UI
