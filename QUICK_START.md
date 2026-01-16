# Quick Start Guide - Create .env.local

## Step 1: Create the File

1. In your project root (`discord-ai-copilot`), create a new file named `.env.local`
2. Copy and paste this content:

```env
# Supabase (Your credentials from README)
NEXT_PUBLIC_SUPABASE_URL=https://zixtukcgtvuuruvrtbai.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHR1a2NndHZ1dXJ1dnJ0YmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjQ2MTYsImV4cCI6MjA4MzgwMDYxNn0.BlfjXLfuhuFKNUtzg4a5ph2wTo_VM49gH4YFGvAkeHg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHR1a2NndHZ1dXJ1dnJ0YmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIyNDYxNiwiZXhwIjoyMDgzODAwNjE2fQ.M1rtbFU9cbkBeJwWjoPvMGM4or6ELvccKmD2OvJqSLE

# AI Provider (Groq - Free) - Add your key later
GROQ_API_KEY=your_groq_api_key_here
AI_PROVIDER=groq
AI_MODEL=llama-3.1-70b-versatile

# Discord - Add later when building bot
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_BOT_TOKEN=your_discord_bot_token_here
```

3. **Save the file**

---

## Step 2: Restart Dev Server

**Important:** You MUST restart the server after creating `.env.local`!

1. In your terminal where `npm run dev` is running, press **Ctrl+C** to stop it
2. Run again: `npm run dev`

---

## Step 3: Test APIs

Open these URLs in your browser:

### ✅ Test 1: Health Check

**URL:** http://localhost:3000/api/health

**Expected:**

```json
{
  "status": "ok",
  "message": "Discord AI Copilot API is running",
  "phase": "Phase 1 Complete - Ready for Phase 2",
  "timestamp": "..."
}
```

### ✅ Test 2: Settings API (Tests Database Connection)

**URL:** http://localhost:3000/api/settings

**Expected:**

```json
{
  "success": true,
  "data": {
    "instructions": "You are a helpful Discord assistant...",
    "aiConfig": {
      "model": "llama-3.1-70b-versatile",
      "temperature": 0.7,
      "provider": "groq"
    }
  }
}
```

**If you see this, your database connection works! ✅**

### ✅ Test 3: Channels API

**URL:** http://localhost:3000/api/channels

**Expected:**

```json
{
  "success": true,
  "data": []
}
```

(Empty array is fine - no channels added yet)

### ✅ Test 4: Memory API

**URL:** http://localhost:3000/api/memory

**Expected:**

```json
{
  "success": true,
  "data": []
}
```

(Empty array is fine - no conversations yet)

---

## Troubleshooting

### ❌ "Failed to fetch settings" or 500 error

**Check:**

1. Did you restart the dev server after creating `.env.local`?
2. Is `.env.local` in the project root (same folder as `package.json`)?
3. Did you run the SQL schema in Supabase? (Go to Supabase > SQL Editor > Run `schema.sql`)
4. Check terminal for error messages

### ❌ "relation does not exist"

**Solution:** Run the database schema in Supabase:

1. Go to your Supabase project
2. Click **SQL Editor**
3. Copy contents of `supabase/schema.sql`
4. Paste and click **Run**

### ❌ Can't see `.env.local` file

- It's a hidden file (starts with `.`)
- In VS Code: File > Preferences > Settings > Search "files.exclude" > Remove `.env.local` from list
- Or use terminal: `notepad .env.local` (Windows)

---

## Success Checklist

- [ ] `.env.local` file created in project root
- [ ] Supabase credentials added
- [ ] Dev server restarted
- [ ] `/api/health` returns JSON
- [ ] `/api/settings` returns data (not error)
- [ ] `/api/channels` returns empty array
- [ ] `/api/memory` returns empty array

**Once all checkboxes are done, you're ready for Phase 3! 🎉**
