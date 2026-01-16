<p align="center">
  <img src="public/logo.svg" alt="Discord AI Copilot" width="180" />
</p>

<h1 align="center">Discord AI Copilot</h1>

<p align="center">
  <strong>An enterprise-grade AI-powered Discord assistant with admin-controlled behavior, persistent memory, and Retrieval-Augmented Generation (RAG).</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Discord.js-14-5865F2?logo=discord" alt="Discord.js" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?logo=google" alt="Gemini" />
</p>

---

## Overview

Discord AI Copilot is a production-ready AI assistant system that combines a **Next.js admin dashboard** with a **Node.js Discord bot**. It provides intelligent, context-aware responses while giving administrators full control over behavior, channels, and knowledge base.

### Key Highlights

- 🎛️ **Admin Dashboard** – Real-time control over bot instructions, channels, and memory
- 🤖 **Smart Discord Bot** – Context-aware responses with rolling conversation memory
- 🧠 **RAG System** – Ground responses in your documentation using vector search
- 🔐 **Secure Auth** – Supabase-powered authentication for admin access
- 💾 **Persistent Memory** – Rolling summaries that survive restarts (95% token savings)
- 📊 **Token Efficiency** – Intelligent summarization reduces API costs significantly

---

## Features

### Admin Dashboard

| Feature                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| **System Instructions** | Define bot personality, rules, and behavior in real-time   |
| **Channel Management**  | Control which Discord channels the bot responds in         |
| **Memory Viewer**       | Inspect rolling summaries and token efficiency per channel |
| **Knowledge Base**      | Ingest documents for RAG-powered contextual responses      |
| **Auth System**         | Secure login with Supabase Auth (email/password)           |

### Discord Bot

| Feature                  | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| **Contextual Responses** | Uses conversation history + summaries for coherent replies |
| **Rolling Summaries**    | Auto-generates summaries every 10 messages to save tokens  |
| **RAG Integration**      | Retrieves relevant knowledge chunks to ground responses    |
| **Thread Support**       | Works in both channels and thread conversations            |
| **Typing Indicators**    | Shows typing status while generating responses             |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                          │
│                     (Next.js + Vercel)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Instructions│  │  Channels   │  │   Memory    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                     │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  settings   │  │  channels   │  │  summaries  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │  messages   │  │ knowledge   │ ← pgvector embeddings         │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DISCORD BOT                               │
│                   (Node.js + Railway)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Handler    │  │   Memory    │  │    RAG      │              │
│  │  Service    │  │   Service   │  │   Service   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                     │
│         └────────────────┴────────────────┘                     │
│                          │                                      │
│                          ▼                                      │
│                   ┌─────────────┐                               │
│                   │  Gemini AI  │                               │
│                   └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer           | Technology                       | Purpose                          |
| --------------- | -------------------------------- | -------------------------------- |
| **Frontend**    | Next.js 14, React 18, TypeScript | Admin dashboard with App Router  |
| **Styling**     | Tailwind CSS, Radix UI           | Modern, accessible UI components |
| **Backend**     | Next.js API Routes               | RESTful API for admin operations |
| **Database**    | Supabase (PostgreSQL)            | Data persistence + real-time     |
| **Vector DB**   | pgvector extension               | RAG embeddings storage           |
| **Auth**        | Supabase Auth                    | Secure admin authentication      |
| **Bot Runtime** | Node.js, Discord.js 14           | Discord bot framework            |
| **AI Provider** | Google Gemini                    | LLM for responses + embeddings   |
| **Deployment**  | Vercel (web), Railway (bot)      | Production hosting               |

---

## Project Structure

```
discord-ai-copilot/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin dashboard pages
│   │   ├── dashboard/            # Overview & stats
│   │   ├── instructions/         # Bot behavior config
│   │   ├── channels/             # Channel allow-list
│   │   ├── memory/               # Conversation summaries
│   │   └── knowledge/            # RAG document ingestion
│   ├── (auth)/                   # Authentication pages
│   │   └── login/                # Admin login
│   └── api/                      # API routes
│       ├── settings/             # Instructions CRUD
│       ├── channels/             # Channels CRUD
│       └── memory/               # Memory operations
├── bot/                          # Discord bot (Node.js)
│   └── src/
│       ├── handlers/             # Message handling
│       ├── services/             # AI, DB, Memory, RAG
│       └── utils/                # Logger, prompt builder
├── lib/                          # Shared utilities
│   ├── rag/                      # RAG modules (chunker, embeddings)
│   └── supabase/                 # Database clients & queries
├── components/                   # Reusable UI components
├── public/                       # Static assets (logo)
└── supabase/                     # Database schema & migrations
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Discord Developer account
- Google AI Studio account (for Gemini API)

### 1. Clone the Repository

```bash
git clone https://github.com/AnshMeshram/discord-ai-copilot.git
cd discord-ai-copilot
```

### 2. Install Dependencies

```bash
# Install web app dependencies
npm install

# Install bot dependencies
cd bot && npm install && cd ..
```

### 3. Set Up Supabase

1. Create a new Supabase project
2. Run the schema in `supabase/schema.sql` via SQL Editor
3. Enable pgvector extension (included in schema)
4. Copy your project URL and keys

### 4. Configure Environment Variables

Create `.env.local` in root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini (for RAG embeddings in admin)
GEMINI_API_KEY=your_gemini_api_key
```

Create `.env` in `bot/`:

```env
# Discord
DISCORD_TOKEN=your_discord_bot_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run Locally

```bash
# Terminal 1: Run admin dashboard
npm run dev

# Terminal 2: Run Discord bot
cd bot && npm run dev
```

- Admin Dashboard: http://localhost:3000
- Login with your Supabase Auth credentials

---

## Deployment

### Admin Dashboard (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Discord Bot (Railway)

1. Create new Railway project
2. Connect GitHub repo, set root to `/bot`
3. Add environment variables
4. Deploy

---

## Environment Variables

### Admin Dashboard (`.env.local`)

| Variable                        | Description               |
| ------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key |
| `GEMINI_API_KEY`                | Google Gemini API key     |

### Discord Bot (`bot/.env`)

| Variable                    | Description               |
| --------------------------- | ------------------------- |
| `DISCORD_TOKEN`             | Discord bot token         |
| `NEXT_PUBLIC_SUPABASE_URL`  | Supabase project URL      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY`            | Google Gemini API key     |

---

## API Reference

### Settings API

| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| `GET`  | `/api/settings` | Get current instructions |
| `PUT`  | `/api/settings` | Update instructions      |

### Channels API

| Method   | Endpoint            | Description               |
| -------- | ------------------- | ------------------------- |
| `GET`    | `/api/channels`     | List allowed channels     |
| `POST`   | `/api/channels`     | Add channel to allow-list |
| `DELETE` | `/api/channels?id=` | Remove channel            |

### Memory API

| Method   | Endpoint                 | Description               |
| -------- | ------------------------ | ------------------------- |
| `GET`    | `/api/memory`            | Get all channel summaries |
| `DELETE` | `/api/memory?channelId=` | Reset channel memory      |

---

## Memory System

The bot uses a **rolling summary** approach to maintain context while minimizing token usage:

1. **Message Tracking** – Every user/bot message increments a counter
2. **Summary Trigger** – At every 10th message, AI generates a summary
3. **Context Building** – Prompts include: instructions + summary + recent messages
4. **Token Savings** – Achieves ~95% reduction vs. full history

```
Messages 1-10  → Summary A
Messages 11-20 → Summary B (incorporates A)
Messages 21-30 → Summary C (incorporates B)
```

---

## RAG System

The Retrieval-Augmented Generation system grounds bot responses in your documentation:

1. **Document Ingestion** – Upload text/markdown via admin dashboard
2. **Chunking** – Documents split into ~800 character chunks
3. **Embedding** – Gemini `text-embedding-004` creates vectors
4. **Storage** – Vectors stored in Supabase pgvector
5. **Retrieval** – User messages embed → similarity search → top 5 chunks
6. **Augmentation** – Retrieved chunks added to AI prompt context

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/AnshMeshram">Ansh Meshram</a>
</p>
