# Implementation Guide: Discord AI Copilot

## MVP Scope (What We're Building)

**Core Features:**

1. ✅ Admin web console to manage system instructions
2. ✅ Discord bot that responds in allow-listed channels
3. ✅ Conversation memory with rolling summaries
4. ✅ Channel allow-list management
5. ⚠️ RAG (PDF knowledge) - **OPTIONAL** - Skip for MVP

**Tech Stack (As Per Project Brief):**

- **Web App:** Next.js ✅ (Brief: "Next.js is preferred")
- **Backend/Database:** Supabase ✅ (Brief: "Supabase is preferred - robust and supports pgvector")
- **Discord Bot:** Node.js + discord.js ✅ (Brief: "Node.js or Python can be used")
- **AI Provider:** OpenAI API (or Claude/Gemini - developer choice)
- **Deployment:** Vercel (web) + Railway/Render (bot)

---

## Phase 1: Project Setup & Foundation

### Step 1.1: Initialize Next.js Project

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

**Project Structure:**

```
discord-ai-copilot/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin routes (protected)
│   │   ├── dashboard/     # Main admin interface
│   │   ├── settings/      # System instructions editor
│   │   └── channels/      # Allow-list management
│   ├── api/               # API routes
│   │   ├── settings/      # CRUD for system instructions
│   │   ├── channels/      # Allow-list management
│   │   ├── memory/        # Conversation summaries
│   │   └── health/        # Health check
│   └── layout.tsx
├── bot/                   # Discord bot (separate service)
│   ├── src/
│   │   ├── index.ts       # Bot entry point
│   │   ├── handlers/      # Message handlers
│   │   ├── services/      # AI, memory, database
│   │   └── utils/         # Helpers
│   ├── package.json
│   └── tsconfig.json
├── lib/                   # Shared utilities
│   ├── supabase/          # Supabase client
│   └── types/             # Shared TypeScript types
├── .env.local             # Environment variables
└── package.json
```

### Step 1.2: Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id

# AI Provider (choose one)
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_claude_key

# Optional: RAG
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### Step 1.3: Install Core Dependencies

**Web App:**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install zod  # For validation
```

**Discord Bot:**

```bash
cd bot
npm init -y
npm install discord.js dotenv
npm install @supabase/supabase-js openai
npm install -D typescript @types/node tsx
```

---

## Phase 2: Database Schema & Supabase Setup

### Step 2.1: Create Supabase Tables

Run this SQL in Supabase SQL Editor:

```sql
-- System settings (instructions, model config)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('system_instructions', '{"text": "You are a helpful Discord assistant."}'),
  ('ai_config', '{"model": "gpt-4o-mini", "temperature": 0.7}');

-- Channel allow-list
CREATE TABLE allowed_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT UNIQUE NOT NULL,
  channel_name TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation messages (for memory)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation summaries (rolling memory)
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

### Step 2.2: Set Up Row Level Security (RLS)

For MVP, we'll use service role key for admin operations. For production, add RLS policies.

---

## Phase 3: Admin Web Console

### Step 3.1: Supabase Client Setup

**`lib/supabase/client.ts`**

- Create Supabase client for client-side operations

**`lib/supabase/server.ts`**

- Create Supabase client for server-side (API routes)

### Step 3.2: API Routes

**`app/api/settings/route.ts`**

- `GET` - Fetch current system instructions
- `PUT` - Update system instructions

**`app/api/channels/route.ts`**

- `GET` - List all allowed channels
- `POST` - Add channel to allow-list
- `DELETE` - Remove channel from allow-list

**`app/api/memory/route.ts`**

- `GET` - Get conversation summary for a channel
- `DELETE` - Reset conversation summary

### Step 3.3: Admin UI Pages

**`app/(admin)/dashboard/page.tsx`**

- Overview: current settings, channel count, memory status

**`app/(admin)/settings/page.tsx`**

- Text area for system instructions
- Save button
- Preview current instructions

**`app/(admin)/channels/page.tsx`**

- Table of allowed channels
- Add channel form (input channel ID)
- Remove channel button

**`app/(admin)/memory/page.tsx`**

- List all channels with summaries
- View summary content
- Reset button per channel

### Step 3.4: Admin Authentication (Required for Handoff)

**Requirement:** Must provide admin login credentials for review.

**Recommended: Supabase Auth**

- Use Supabase Auth for proper user management
- Email/password authentication
- Row Level Security (RLS) policies
- Easy to provide test credentials

**Implementation:**

- `app/(auth)/login/page.tsx` - Login page
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/logout/route.ts` - Logout endpoint
- Middleware to protect admin routes
- Session management

---

## Phase 4: Discord Bot

### Step 4.1: Bot Structure

**`bot/src/index.ts`**

- Initialize Discord client
- Load settings from Supabase on startup
- Set up message handler
- Connect to Discord

**`bot/src/handlers/messageHandler.ts`**

- **CRITICAL:** Check if bot is mentioned FIRST (responds even if not allow-listed)
- Check if channel is allow-listed (if not mentioned)
- Ignore bot's own messages
- Call AI service to generate response
- Send response to Discord
- Log message to database

**`bot/src/services/aiService.ts`**

- Fetch system instructions from Supabase
- Fetch conversation summary
- Build prompt with instructions + summary + new message
- Call OpenAI/Claude API
- Return response

**`bot/src/services/memoryService.ts`**

- Save messages to database
- Update/create conversation summaries
- Implement rolling summary logic (every N messages or on demand)

**`bot/src/services/databaseService.ts`**

- Supabase client for bot
- Helper functions for settings, channels, messages, summaries

### Step 4.2: Bot Logic Flow

```
1. Bot receives message in Discord
2. Check: Is bot mentioned? ──YES──> Process (skip allow-list)
   │
   NO
   │
3. Check: Is channel in allow-list? ──YES──> Process
   │
   NO
   │
4. Ignore message

Processing Flow:
   a. Fetch system instructions from Supabase
   b. Fetch conversation summary for this channel
   c. Build AI prompt: instructions + summary + new message
   d. Call AI API
   e. Send response to Discord
   f. Save message to database
   g. Update summary (every 10 messages or on demand)
```

### Step 4.3: Error Handling

- Graceful degradation if Supabase is down
- Rate limiting for AI API calls
- Retry logic for failed requests
- Logging for debugging

---

## Phase 5: Memory & Summarization

### Step 5.1: Rolling Summary Strategy

**Simple Approach (MVP):**

- Every 10 messages, summarize the conversation
- Keep last 20 messages + summary
- Use AI to create new summary: "Previous summary + new messages"

**Implementation:**

- `bot/src/services/memoryService.ts`
- Function: `updateSummary(channelId, newMessages)`
- Call AI with: "Summarize this conversation: [summary] + [new messages]"
- Store result in `summaries` table

### Step 5.2: Summary Reset

- Admin can reset via web console
- Bot can reset on command (optional): `!reset` or `!clear`

---

## Phase 6: Testing & Polish

### Step 6.1: Manual Testing Checklist

**Admin Console:**

- [ ] Admin can log in with credentials
- [ ] Admin can update system instructions
- [ ] Admin can add/remove channels
- [ ] Admin can view conversation summaries
- [ ] Admin can reset summaries

**Discord Bot:**

- [ ] Bot responds in allow-listed channels
- [ ] Bot responds when mentioned (even if not allow-listed) ⚠️ CRITICAL
- [ ] Bot ignores non-allow-listed channels (unless mentioned)
- [ ] Conversation summaries are created/updated
- [ ] Bot handles errors gracefully

### Step 6.4: Handoff Preparation (Required)

**Deliverables for Review:**

- [ ] **Live Admin Dashboard URL** (Vercel deployment)
- [ ] **Admin Login Credentials** (email/password documented)
- [ ] **Discord Server Invite Link** (bot active and testable)
- [ ] **README.md** updated with setup instructions
- [ ] **Environment Variables** documented in `.env.example`

### Step 6.2: Deployment

**Web App (Vercel):**

- Connect GitHub repo
- Add environment variables
- Deploy

**Discord Bot (Railway/Render):**

- Create new project
- Connect GitHub repo
- Add environment variables
- Set start command: `npm start` or `tsx src/index.ts`
- Keep it running (always-on)

### Step 6.3: Monitoring

- Add health check endpoint
- Log errors to console (or use service like Sentry)
- Monitor bot uptime

---

## Implementation Order (Recommended)

1. ✅ **Setup** - Project structure, dependencies, env vars
2. ✅ **Database** - Supabase tables, schema
3. ✅ **API Routes** - Backend endpoints for admin
4. ✅ **Admin UI** - Basic pages to manage settings
5. ✅ **Discord Bot** - Core bot functionality
6. ✅ **Memory** - Summarization system
7. ✅ **Testing** - Manual testing, fixes
8. ✅ **Deploy** - Production deployment

---

## Key Decisions Made (MVP Focus)

- ❌ **No RAG** - Skip PDF knowledge for MVP (focus on perfect core agent)
- ✅ **Supabase Auth** - Required for handoff (admin login credentials)
- ✅ **Bot Mention Override** - Bot responds when mentioned, even if not allow-listed ⚠️ CRITICAL
- ✅ **Rolling Summaries** - Every 10 messages, simple approach
- ✅ **No Thread Support** - Focus on channels only
- ✅ **Single AI Provider** - Start with OpenAI, easy to swap later
- ✅ **No Rate Limiting UI** - Bot handles it internally
- ✅ **Reliability First** - Error handling, graceful degradation, no crashes

---

## Next Steps After MVP

- Add RAG (PDF upload, vector search)
- Better authentication (Supabase Auth)
- Thread support
- Analytics dashboard
- Multiple AI provider support
- Advanced memory strategies

---

## Alignment with Project Brief

### ✅ Requirements Met

**Phase 1: Admin Web Console**

- ✅ Update System Instructions (text area)
- ⚠️ Knowledge Management (RAG) - Optional, skip for MVP
- ✅ Memory Control (view running summary + reset button)
- ✅ Discord Allow-list (input channel IDs)

**Phase 2: Discord Bot**

- ✅ Responds in allow-listed channels **OR when mentioned** ⚠️ CRITICAL
- ✅ Context Awareness: Instructions + Rolling Summary + (Optional RAG)

**Handoff Requirements**

- ✅ Live Admin Dashboard URL
- ✅ Admin Login Credentials
- ✅ Discord Server Invite Link

**Evaluation Criteria**

- ✅ **Organization** - Clear structure, logical phases
- ✅ **Vibe Coding** - Fast iteration, AI-assisted development
- ✅ **Reliability** - Error handling, end-to-end testing

---

## Questions to Answer Before Coding

1. **AI Provider?** (OpenAI, Claude, Gemini) - ✅ **OpenAI** (recommended)
2. **Bot Deployment?** (Railway, Render, VPS) - ✅ **Railway** (recommended)
3. **Auth Method?** - ✅ **Supabase Auth** (required for handoff)
4. **Summary Frequency?** - ✅ **Every 10 messages**
5. **RAG Implementation?** - ❌ **Skip for MVP** (focus on perfect core)

---

**Ready to start coding? Let's begin with Phase 1: Project Setup! 🚀**
