# Project Plan: Discord AI Copilot
## Aligned with Official Project Brief

---

## 📋 Requirements Analysis

### Core Requirements (Must Have)

#### Phase 1: Admin Web Console (The Architect)
1. ✅ **Update System Instructions** - Text area for bot personality, tone, rules
2. ⚠️ **Knowledge Management (Optional RAG)** - PDF upload, chunking, vector DB storage
3. ✅ **Memory Control** - View running summary + reset session button
4. ✅ **Discord Allow-list** - Input field for channel IDs where bot can reply

#### Phase 2: Discord Bot (The Executive)
1. ✅ **Interaction** - Respond in allow-listed channels **OR when mentioned**
2. ✅ **Context Awareness** - Assemble responses using:
   - Admin's current instructions
   - Rolling summary of previous conversation
   - (Optional) Relevant PDF snippets if RAG implemented

### Handoff Requirements (For Review)
1. ✅ **Live URL** - Admin Dashboard (e.g., Vercel)
2. ✅ **Admin Login Credentials** - Must provide working auth
3. ✅ **Discord Server Invite** - Bot must be active and testable

### Evaluation Criteria
- **Organization** - How we prioritize and structure the build
- **Vibe Coding** - Effective use of AI tools for fast, quality code
- **Reliability** - End-to-end system that works without breaking

---

## 🎯 MVP vs Full Scope Decision

### MVP Scope (Recommended)
**Focus: Perfect execution of core features**

- ✅ System Instructions management
- ✅ Memory Control (view + reset)
- ✅ Channel Allow-list
- ✅ Bot responds in allow-list **OR when mentioned**
- ✅ Rolling conversation summaries
- ✅ Proper Admin Authentication
- ❌ **Skip RAG** - Focus on perfecting core agent

**Rationale:** Brief says "perfectly executed agent driven by System Instructions" is acceptable. Better to nail the core than rush RAG.

### Full Scope (If Time Permits)
- ✅ Everything in MVP
- ✅ RAG: PDF upload, chunking, pgvector storage, retrieval

---

## 🏗️ Architecture Plan

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Web Console                     │
│                  (Next.js - Vercel)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Instructions │  │  Allow-list  │  │   Memory     │  │
│  │   Editor     │  │  Manager     │  │   Control    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ API Calls
                        │
┌───────────────────────▼──────────────────────────────────┐
│              Supabase (PostgreSQL)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   settings   │  │allowed_       │  │  summaries   │  │
│  │              │  │  channels     │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   messages   │  │  documents    │  │   chunks     │  │
│  │              │  │  (RAG opt)    │  │  (RAG opt)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ Read Settings/Summaries
                        │ Write Messages/Summaries
                        │
┌───────────────────────▼──────────────────────────────────┐
│              Discord Bot (Node.js)                        │
│                  (Railway/Render)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Message    │  │     AI       │  │   Memory     │  │
│  │   Handler    │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ Discord API
                        │
┌───────────────────────▼──────────────────────────────────┐
│                    Discord Server                         │
│              (User-facing interface)                       │
└───────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
discord-ai-copilot/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth pages
│   │   └── login/               # Admin login page
│   ├── (admin)/                 # Protected admin routes
│   │   ├── dashboard/           # Overview dashboard
│   │   ├── instructions/        # System instructions editor
│   │   ├── channels/            # Allow-list management
│   │   └── memory/              # Memory control (view + reset)
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── settings/            # System instructions CRUD
│   │   ├── channels/            # Allow-list CRUD
│   │   ├── memory/              # Summary view/reset
│   │   └── health/              # Health check
│   └── layout.tsx
├── bot/                         # Discord bot (separate service)
│   ├── src/
│   │   ├── index.ts             # Bot entry point
│   │   ├── handlers/
│   │   │   └── messageHandler.ts
│   │   ├── services/
│   │   │   ├── aiService.ts     # AI API calls
│   │   │   ├── memoryService.ts # Summary management
│   │   │   ├── databaseService.ts
│   │   │   └── ragService.ts    # Optional RAG
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Client-side Supabase
│   │   └── server.ts            # Server-side Supabase
│   ├── auth/                    # Auth utilities
│   └── types/                   # Shared TypeScript types
├── .env.local                   # Environment variables
├── .env.example                 # Example env file
└── README.md
```

---

## 🗄️ Database Schema

### Core Tables (Required)

```sql
-- System settings (instructions, AI config)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
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

-- Indexes
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

### Optional RAG Tables

```sql
-- PDF documents (if RAG implemented)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks with embeddings (if RAG implemented)
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  content TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI embedding dimension
  chunk_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable pgvector extension (if RAG implemented)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops);
```

---

## 🔐 Authentication Strategy

### Requirement: Admin Login Credentials for Handoff

**Option 1: Supabase Auth (Recommended)**
- Use Supabase Auth for proper user management
- Email/password or magic link
- Row Level Security (RLS) policies
- Easy to provide test credentials

**Option 2: Simple Password (MVP Fallback)**
- Environment variable password
- Session-based auth
- Less secure but faster to implement

**Decision: Use Supabase Auth** - Required for handoff, more professional.

---

## 🤖 Bot Logic: "Allow-list OR Mentioned"

### Critical Requirement
Bot must respond if:
1. ✅ Channel is in allow-list, OR
2. ✅ Bot is mentioned (@bot) anywhere

### Implementation Flow

```
Message Received
    │
    ├─ Is bot mentioned? ──YES──> Process (skip allow-list check)
    │   │
    │   NO
    │   │
    ├─ Is channel in allow-list? ──YES──> Process
    │   │
    │   NO
    │   │
    └─> Ignore message
```

**Code Logic:**
```typescript
if (message.mentions.has(client.user) || isChannelAllowed(channelId)) {
  // Process message
}
```

---

## 📝 Implementation Phases

### Phase 1: Foundation (Day 1)
**Goal:** Project structure, database, basic setup

1. Initialize Next.js project
2. Set up Supabase project
3. Create database schema
4. Configure environment variables
5. Set up basic folder structure

**Deliverable:** Working database, project structure

---

### Phase 2: Admin Auth & Core API (Day 1-2)
**Goal:** Authentication + backend APIs

1. Implement Supabase Auth
2. Create login page
3. Build API routes:
   - `/api/auth/*` - Login/logout
   - `/api/settings` - System instructions CRUD
   - `/api/channels` - Allow-list CRUD
   - `/api/memory` - Summary view/reset
4. Add middleware for route protection

**Deliverable:** Working auth + all API endpoints

---

### Phase 3: Admin UI (Day 2-3)
**Goal:** Complete admin console

1. Dashboard page (overview)
2. Instructions editor page
3. Channels allow-list page
4. Memory control page (view summaries + reset)
5. Navigation/layout

**Deliverable:** Fully functional admin console

---

### Phase 4: Discord Bot Core (Day 3-4)
**Goal:** Bot that responds with AI

1. Initialize Discord bot
2. Message handler (allow-list OR mentioned)
3. AI service (fetch instructions + summary, call API)
4. Database service (read/write messages, summaries)
5. Basic error handling

**Deliverable:** Bot responds in Discord

---

### Phase 5: Memory System (Day 4)
**Goal:** Rolling conversation summaries

1. Message logging to database
2. Summary generation (every 10 messages)
3. Summary update logic
4. Integration with AI responses

**Deliverable:** Working memory system

---

### Phase 6: Testing & Reliability (Day 5)
**Goal:** End-to-end testing, error handling

1. Test all admin features
2. Test bot in Discord
3. Error handling improvements
4. Rate limiting
5. Health checks
6. Documentation

**Deliverable:** Reliable, tested system

---

### Phase 7: Deployment & Handoff (Day 5)
**Goal:** Deploy and prepare handoff

1. Deploy web app to Vercel
2. Deploy bot to Railway/Render
3. Create test Discord server
4. Document credentials
5. Create handoff document

**Deliverable:** Live system ready for review

---

### Phase 8: Optional RAG (If Time Permits)
**Goal:** PDF knowledge base

1. PDF upload UI
2. PDF parsing and chunking
3. Embedding generation
4. Vector storage (pgvector)
5. RAG retrieval in bot responses

**Deliverable:** Full RAG system

---

## 🎯 Key Implementation Decisions

### Tech Stack (As Per Project Brief)
- **Web App:** Next.js ✅ (Brief: "Next.js is preferred")
- **Backend/Database:** Supabase ✅ (Brief: "Supabase is preferred - robust and supports pgvector")
- **Discord Bot:** Node.js + discord.js ✅ (Brief: "Node.js or Python can be used")
- **AI Provider:** OpenAI API (or Claude/Gemini - developer choice)
- **Auth:** Supabase Auth (using Supabase's built-in auth)
- **Deployment:** Vercel (web) + Railway/Render (bot)

### AI Provider Choice
**Recommendation: OpenAI**
- Best documentation
- Reliable API
- Good embedding model for RAG
- Easy to swap later if needed

### Memory Strategy
- **Summary Frequency:** Every 10 messages
- **Summary Method:** AI-generated rolling summary
- **Storage:** Single summary per channel in `summaries` table
- **Reset:** Admin can reset via UI

### Error Handling Priorities
1. **Bot never crashes** - Try/catch all async operations
2. **Graceful degradation** - If Supabase down, bot uses cached settings
3. **Rate limiting** - Prevent API abuse
4. **Logging** - Console logs for debugging

---

## ✅ Handoff Checklist

### Required Deliverables
- [ ] **Live Admin Dashboard URL** (Vercel)
- [ ] **Admin Login Credentials** (email/password)
- [ ] **Discord Server Invite Link** (bot active)
- [ ] **README.md** with setup instructions
- [ ] **Environment Variables** documented

### Testing Checklist
- [ ] Admin can log in
- [ ] Admin can update system instructions
- [ ] Admin can add/remove channels
- [ ] Admin can view conversation summaries
- [ ] Admin can reset summaries
- [ ] Bot responds in allow-listed channels
- [ ] Bot responds when mentioned (even if not allow-listed)
- [ ] Bot ignores non-allow-listed channels (unless mentioned)
- [ ] Conversation summaries are created/updated
- [ ] System handles errors gracefully

---

## 🚀 Getting Started

### Prerequisites
1. Node.js 18+
2. Supabase account
3. Discord Developer account (bot token)
4. OpenAI API key (or Claude/Gemini)
5. Vercel account (deployment)
6. Railway/Render account (bot deployment)

### First Steps
1. Clone/create project
2. Run `npm install` in root
3. Set up Supabase project
4. Run database schema SQL
5. Configure `.env.local`
6. Start development

---

## 📊 Success Metrics

### Organization
- ✅ Clear project structure
- ✅ Logical code organization
- ✅ Proper separation of concerns
- ✅ Good documentation

### Vibe Coding
- ✅ Fast iteration
- ✅ Clean, maintainable code
- ✅ Effective use of AI tools
- ✅ No over-engineering

### Reliability
- ✅ End-to-end functionality
- ✅ Error handling
- ✅ No crashes
- ✅ Works consistently

---

## 🎓 Next Steps

1. **Review this plan** - Ensure alignment with requirements
2. **Set up accounts** - Supabase, Discord, OpenAI, Vercel, Railway
3. **Start Phase 1** - Foundation setup
4. **Iterate quickly** - Use AI tools effectively
5. **Test frequently** - Don't wait until the end
6. **Deploy early** - Get it live ASAP for testing

---

**Ready to build? Let's start with Phase 1! 🚀**
