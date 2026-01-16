# Environment Variables Setup Guide

## Step 1: Create .env.local File

The `.env.local` file has been created for you! It contains your Supabase credentials.

**Location:** `discord-ai-copilot/.env.local`

---

## Step 2: Add Missing Credentials

You still need to add:

<!-- Groq setup temporarily hidden; using Gemini by default -->
<!--
### 1. Groq API Key (Free AI) - Detailed Setup

#### Option A: Groq (Recommended - 100% Free)

**Why Groq?**

- ✅ Completely free (no credit card required)
- ✅ Fast inference (faster than OpenAI)
- ✅ Uses powerful open-source models (Llama 3.1 70B)
- ✅ No usage limits on free tier

**Step-by-Step Setup:**

1. **Visit Groq Console**

   ```
   https://console.groq.com
   ```

2. **Create Account**

   - Click "Sign Up" or "Get Started"
   - Use Google, GitHub, or email to sign up
   - **No credit card needed!**

3. **Navigate to API Keys**

   - After login, you'll see the dashboard
   - Look for "API Keys" in the left sidebar
   - Or go directly to: https://console.groq.com/keys

4. **Create New API Key**

   - Click "Create API Key" button
   - Give it a name (e.g., "Discord AI Copilot")
   - Click "Submit" or "Create"

5. **Copy Your API Key**

   - You'll see a key starting with `gsk_...`
   - **Important:** Copy it immediately - you won't see it again!
   - Example format: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

6. **Add to .env.local**

   - Open your `.env.local` file
   - Find the line: `GROQ_API_KEY=your_groq_api_key_here`
   - Replace with your actual key:
     ```env
     GROQ_API_KEY=gsk_your_actual_key_here
     ```
   - Save the file

7. **Verify Setup**
   - Restart your dev server (Ctrl+C, then `npm run dev`)
   - The bot will use Groq's Llama 3.1 70B model

**Available Groq Models:**

- `llama-3.1-70b-versatile` (default, recommended)
- `mixtral-8x7b-32768`
- `gemma-7b-it`

---
-->

#### Option B: Google Gemini (Free - 60 requests/min) ✨ **NEW**

**Why Google Gemini?**

- ✅ Completely free (no credit card required)
- ✅ Advanced reasoning capabilities
- ✅ Good for complex tasks
- ✅ 1.5M tokens context window
- ⚠️ Rate limit: 60 requests/minute (sufficient for MVP)

**Step-by-Step Setup:**

1. **Visit Google AI Studio**

   ```
   https://ai.google.dev
   ```

2. **Sign In**

   - Click "Get API key" or "Sign in"
   - Use your Google account
   - **No credit card needed!**

3. **Create API Key**

   - Click "Get API key" button
   - Click "Create API key in new project"
   - Google will generate your API key automatically
   - Click "Copy" to copy the key
   - Format: `AIza...` (long string starting with AIza)

4. **Add to .env.local**

   - Open your `.env.local` file
   - Find these lines:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     AI_PROVIDER=gemini
     AI_MODEL=gemini-1.5-flash
     ```
   - Replace with your actual key:
     ```env
     GEMINI_API_KEY=AIza_your_actual_key_here
     AI_PROVIDER=gemini
     AI_MODEL=gemini-1.5-flash
     ```
   - Comment out other providers:
     ```env
     # GROQ_API_KEY=...
     # OPENAI_API_KEY=...
     ```
   - Save the file

5. **Verify Setup**
   - Restart your dev server (Ctrl+C, then `npm run dev`)
   - The bot will use Google's Gemini model

**Available Gemini Models:**

- `gemini-1.5-flash` (fast, recommended for MVP)
- `gemini-1.5-pro` (more capable, slower)
- `gemini-2.0-flash` (newest, experimental)

**Free Tier Limits:**

- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ 1.5M input tokens per day
- Perfect for Discord bot MVP!

---

#### Option C: OpenAI (Paid)

**If you prefer OpenAI:**

1. **Get OpenAI API Key**

   - Go to: https://platform.openai.com
   - Sign up and add payment method
   - Go to API Keys section
   - Create new key (starts with `sk-...`)

2. **Update .env.local**
   - Comment out Groq and Gemini lines (add `#` at start):
     ```env
     # GROQ_API_KEY=your_groq_api_key_here
     # GEMINI_API_KEY=your_gemini_api_key_here
     # AI_PROVIDER=gemini
     ```
   - Uncomment OpenAI lines:
     ```env
     OPENAI_API_KEY=sk-your_actual_key_here
     AI_PROVIDER=openai
     AI_MODEL=gpt-4o-mini
     ```

**OpenAI Model Options:**

- `gpt-4o-mini` (recommended, fast & cheap)
- `gpt-4o` (more capable, more expensive)
- `gpt-3.5-turbo` (legacy, cheaper)

---

#### Comparison: Groq vs Gemini vs OpenAI

| Feature            | Groq               | Gemini            | OpenAI               |
| ------------------ | ------------------ | ----------------- | -------------------- |
| **Cost**           | Free               | Free              | Paid                 |
| **Setup**          | Easy               | Very Easy         | Easy (needs payment) |
| **Speed**          | ⭐⭐⭐⭐⭐ Fastest | ⭐⭐⭐⭐ Fast     | ⭐⭐⭐ Medium        |
| **Quality**        | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐ Best   | ⭐⭐⭐⭐⭐ Best      |
| **Rate Limit**     | None               | 60/min            | 3,500/min            |
| **Context Window** | 8K tokens          | 1.5M tokens       | 128K tokens          |
| **Best For**       | Fast responses     | Complex reasoning | Production use       |

**Recommendation:** Start with **Gemini** (free, powerful) or **Groq** (free, fast). Switch to OpenAI if you need production-level support.

---

#### Testing Your AI Setup

After adding your API key, test it:

**For Groq:**

```bash
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_GROQ_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b-versatile",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

<!-- Groq test call hidden while using Gemini -->
<!--
**For Groq:**
```bash
curl -X POST https://api.groq.com/openai/v1/chat/completions \
   -H "Authorization: Bearer YOUR_GROQ_KEY" \
   -H "Content-Type: application/json" \
   -d '{
      "model": "llama-3.1-70b-versatile",
      "messages": [{"role": "user", "content": "Hello!"}]
   }'
```
-->

**For Gemini:**

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello!"}]
    }]
  }'
```

**Expected Response:**
You should get a JSON response with the AI's reply.

### 2. Discord Bot Token - Detailed Setup

**When to do this:** After building the Discord bot (Phase 4)

#### Step-by-Step Discord Bot Setup

**Step 1: Create Discord Application**

1. **Go to Discord Developer Portal**

   ```
   https://discord.com/developers/applications
   ```

2. **Create New Application**
   - Click "New Application" (top right)
   - Give it a name (e.g., "AI Copilot")
   - Accept ToS and click "Create"

**Step 2: Get Client ID**

3. **Copy Application ID**
   - You're now in your app's settings
   - Under "General Information" tab
   - Find "APPLICATION ID"
   - Click "Copy"
   - Save this as your `DISCORD_CLIENT_ID`

**Step 3: Create Bot**

4. **Navigate to Bot Section**

   - Click "Bot" in left sidebar
   - Click "Add Bot" button
   - Confirm by clicking "Yes, do it!"

5. **Configure Bot Settings**

   - **Username:** Set your bot's name
   - **Icon:** Upload an icon (optional)
   - **Public Bot:** Toggle OFF (keep it private)

6. **Get Bot Token**
   - Click "Reset Token" button
   - Confirm the action
   - Click "Copy" to copy the token
   - **Important:** This is shown only once!
   - Save this as your `DISCORD_BOT_TOKEN`
   - Format: `MTIz...` (long string)

**Step 4: Enable Intents**

7. **Scroll down to "Privileged Gateway Intents"**
   - ✅ Enable "MESSAGE CONTENT INTENT" (required)
   - ✅ Enable "SERVER MEMBERS INTENT" (optional)
   - ✅ Enable "PRESENCE INTENT" (optional)
   - Click "Save Changes"

**Step 5: Generate Invite Link**

8. **Go to OAuth2 > URL Generator**
   - In left sidebar: OAuth2 > URL Generator
9. **Select Scopes**

   - Check: `bot`
   - Check: `applications.commands` (for slash commands later)

10. **Select Bot Permissions**

    - ✅ Read Messages/View Channels
    - ✅ Send Messages
    - ✅ Send Messages in Threads
    - ✅ Embed Links
    - ✅ Read Message History
    - ✅ Add Reactions
    - ✅ Use External Emojis

11. **Copy Generated URL**
    - Scroll down to see generated URL
    - Copy the URL
    - Open it in browser to invite bot to your server

**Step 6: Add to .env.local**

12. **Update Environment Variables**
    ```env
    DISCORD_CLIENT_ID=123456789012345678
    DISCORD_BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXX
    ```

**Step 7: Get Channel IDs**

13. **Enable Developer Mode in Discord**

    - Open Discord app
    - User Settings (gear icon)
    - Advanced
    - ✅ Enable "Developer Mode"

14. **Copy Channel IDs**
    - Right-click any channel
    - Click "Copy Channel ID"
    - Use this ID in admin console allow-list

---

#### Quick Discord Bot Checklist

- [ ] Created application on Discord Developer Portal
- [ ] Copied Application ID → `DISCORD_CLIENT_ID`
- [ ] Created bot and copied token → `DISCORD_BOT_TOKEN`
- [ ] Enabled MESSAGE CONTENT INTENT
- [ ] Generated OAuth2 URL with bot scope
- [ ] Invited bot to test server
- [ ] Enabled Developer Mode
- [ ] Copied channel ID for allow-list

---

#### Discord Bot Invite URL Format

Your invite URL will look like:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=412317240384&scope=bot%20applications.commands
```

**Permissions Number:** `412317240384` (Read, Send, History, Reactions)

---

## Step 3: Restart Dev Server

After updating `.env.local`:

1. **Stop the current server** (Ctrl+C in terminal)
2. **Start it again:**
   ```bash
   npm run dev
   ```

**Important:** Next.js only reads `.env.local` on startup, so you must restart!

---

## Step 4: Test the APIs

### Test 1: Health Check

Open in browser: http://localhost:3000/api/health

**Expected Response:**

```json
{
  "status": "ok",
  "message": "Discord AI Copilot API is running",
  "phase": "Phase 1 Complete - Ready for Phase 2",
  "timestamp": "2024-..."
}
```

### Test 2: Settings API

Open in browser: http://localhost:3000/api/settings

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "instructions": "You are a helpful Discord assistant. Be friendly, concise, and helpful.",
    "aiConfig": {
      "model": "llama-3.1-70b-versatile",
      "temperature": 0.7,
      "provider": "groq"
    }
  }
}
```

### Test 3: Channels API

Open in browser: http://localhost:3000/api/channels

**Expected Response:**

```json
{
  "success": true,
  "data": []
}
```

(Empty array is fine - means no channels added yet)

### Test 4: Memory API

Open in browser: http://localhost:3000/api/memory

**Expected Response:**

```json
{
  "success": true,
  "data": []
}
```

(Empty array is fine - means no conversations yet)

---

## Troubleshooting

### "Invalid API key" or "Failed to fetch settings"

- ✅ Check `.env.local` file exists in project root
- ✅ Verify Supabase credentials are correct (no extra spaces)
- ✅ Make sure you restarted the dev server after creating `.env.local`
- ✅ Check terminal for error messages

### "relation does not exist"

- Make sure you ran the SQL schema in Supabase
- Go to Supabase > Table Editor to verify tables exist

### API returns 500 error

- Check terminal logs for detailed error
- Verify Supabase project is active (not paused)
- Make sure database password is set correctly

### Can't see .env.local file

- It's hidden by default (starts with `.`)
- Make sure your editor shows hidden files
- Or use terminal: `type .env.local` (Windows) or `cat .env.local` (Mac/Linux)

---

## Current Status

✅ **Supabase credentials** - Added to `.env.local`  
⏳ **Groq API key** - Need to add (or use OpenAI)  
⏳ **Discord credentials** - Optional for now (add later)

---

## Next Steps

Once APIs are working:

1. ✅ Test all API endpoints
2. ⏭️ Phase 3: Build Admin Authentication
3. ⏭️ Phase 4: Build Admin UI
