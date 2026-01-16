# Complete System Setup & Run Guide

## Prerequisites

- Node.js 18+
- Discord Developer Account
- Supabase Account
- Google AI Studio Account

## Step 1: Get Required Credentials

### Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Create New Application
3. Add Bot
4. **Enable Privileged Intents:**
   - MESSAGE CONTENT INTENT ✅
   - SERVER MEMBERS INTENT ✅
5. Copy token to `.env.local`

### Supabase Credentials

1. Go to https://supabase.com
2. Create new project
3. Go to Settings → API
4. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service Role key)
5. Add to `.env.local`

### Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Create API key
3. Copy to `.env.local`

## Step 2: Update .env.local

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token
```

## Step 3: Setup Database

```bash
# Option A: Use Supabase CLI (recommended)
npx supabase db push

# Option B: Manual - Copy schema.sql and run in Supabase SQL editor
# 1. Open Supabase Dashboard → SQL Editor
# 2. Create new query
# 3. Paste content of supabase/schema.sql
# 4. Run query
```

## Step 4: Start Web Admin Console

```bash
# From root directory
npm install  # (if needed)
npm run dev

# Access at http://localhost:3000
# Creates admin account via login page
```

## Step 5: Configure Allow-Listed Channels

1. Go to http://localhost:3000 (or login)
2. Navigate to Admin → Channels
3. Add Discord channel IDs you want bot to respond in
4. Example: `1234567890123456789`

## Step 6: Add Bot to Discord Server

1. Go back to Discord Developer Portal
2. Your Application → OAuth2 → URL Generator
3. Select scopes:
   - `bot`
   - `applications.commands`
4. Select permissions:
   - Send Messages
   - Read Message History
   - Use External Emojis
5. Copy generated URL
6. Paste in browser
7. Select server and authorize

## Step 7: Start Discord Bot

```bash
# From bot directory
cd bot
npm install  # (if needed)
npm run dev

# Output will show: "✅ Bot logged in as YourBotName#0000"
```

## Step 8: Test End-to-End

1. Go to your Discord server
2. In an allow-listed channel, send a message to the bot
3. Bot should:
   - Show typing indicator
   - Reply within 5-10 seconds
   - Response appears in Admin → Memory as summary

## Troubleshooting

### Bot not responding

- [ ] Check Discord token is correct
- [ ] Verify MESSAGE CONTENT INTENT is enabled
- [ ] Confirm channel is in allow-list (Admin → Channels)
- [ ] Check logs in terminal for errors

### "No rows returned" in admin

- [ ] Run `supabase/schema.sql` in Supabase SQL editor
- [ ] Verify tables exist: `settings`, `allowed_channels`, `messages`, `summaries`

### Gemini API errors

- [ ] Verify API key is correct in `.env.local`
- [ ] Check you haven't exceeded rate limits (60 req/min free tier)
- [ ] Test at https://aistudio.google.com

### Login not working

- [ ] Clear browser cookies
- [ ] Check Supabase credentials in `.env.local`
- [ ] Verify database is connected

## Project Structure

```
discord-ai-copilot/
├── app/                          # Next.js web app
│   ├── (admin)/                  # Protected admin pages
│   │   ├── dashboard/            # Overview stats
│   │   ├── instructions/         # AI instructions editor
│   │   ├── channels/             # Allow-list manager
│   │   └── memory/               # Conversation summaries
│   ├── (auth)/
│   │   └── login/                # Login page
│   └── api/                      # API routes
├── bot/                          # Discord bot
│   ├── src/
│   │   ├── index.ts              # Bot entry point
│   │   ├── handlers/
│   │   │   └── messageHandler.ts # Message processing
│   │   ├── services/
│   │   │   ├── databaseService.ts
│   │   │   ├── aiService.ts      # Gemini integration
│   │   │   └── memoryService.ts  # Summary generation
│   │   └── utils/
│   │       └── logger.ts         # Logging utility
│   └── package.json
├── lib/                          # Shared utilities
│   ├── supabase/                 # Supabase client & queries
│   └── auth/                     # Auth utilities
├── supabase/
│   └── schema.sql                # Database schema
├── middleware.ts                 # Route protection
└── .env.local                    # Environment variables
```

## Key Files

| File                                  | Purpose                          |
| ------------------------------------- | -------------------------------- |
| `middleware.ts`                       | Route protection for admin pages |
| `app/(admin)/layout.tsx`              | Admin console shell + nav        |
| `bot/src/index.ts`                    | Bot entry point                  |
| `bot/src/handlers/messageHandler.ts`  | Message processing pipeline      |
| `bot/src/services/databaseService.ts` | Supabase queries                 |
| `bot/src/services/aiService.ts`       | Gemini API integration           |
| `supabase/schema.sql`                 | Database schema                  |

## Development Commands

```bash
# Web console
npm run dev          # Start Next.js dev server
npm run build        # Build Next.js

# Discord bot
cd bot
npm run dev          # Start bot with auto-reload (tsx watch)
npm run build        # Build TypeScript
npm start            # Run built bot

# Database
npx supabase db push # Sync local schema to cloud
```

## Deployment

### Deploy Web App

```bash
# Push to Vercel (free tier)
npm install -g vercel
vercel
```

### Deploy Bot

```bash
# Deploy to Fly.io (free tier)
npm install -g flyctl
fly launch
fly deploy
```

## Architecture Summary

**Web App (Next.js):**

- Authentication via Supabase Auth
- Protected admin pages behind login
- Routes: Dashboard, Instructions, Channels, Memory

**Discord Bot (discord.js):**

- Listens to channel messages
- Checks allow-list in Supabase
- Fetches context from database
- Calls Gemini API
- Saves responses + summaries

**Database (Supabase PostgreSQL):**

- User authentication
- System instructions + AI config
- Allowed channel list
- Message history (for context)
- Conversation summaries

**AI (Gemini API):**

- Generates responses
- Generates summaries
- Free tier: 60 req/min, 1.5M tokens/day

## What's Next?

### Phase 3 & 4 Testing

1. Test admin login
2. Test bot message responses
3. Verify database saving
4. Check conversation memory

### Future Enhancements

- [ ] PDF knowledge base integration (RAG)
- [ ] Custom per-channel instructions
- [ ] Message reaction handling
- [ ] Thread context management
- [ ] Admin dashboard analytics
- [ ] Bot command handling (slash commands)

## Support

**Issues?**

1. Check terminal/console for error messages
2. Verify all credentials in `.env.local`
3. Check Supabase database has tables
4. Verify Discord bot has MESSAGE CONTENT INTENT
5. Check Gemini API isn't rate limited

**Still stuck?**

- Review error logs in console
- Check `.env.local` is in root directory (not in git)
- Verify internet connection (API calls need network)
