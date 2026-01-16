# 100% Free Setup Guide

## Complete Free Stack for Discord AI Copilot

This guide shows you how to set up the entire project using **only free services** - no credit card required!

---

## 🆓 Free Services We'll Use

| Service         | Free Tier     | What We Get                                 |
| --------------- | ------------- | ------------------------------------------- |
| **AI Provider** | Groq API      | Unlimited free requests (reasonable limits) |
| **Web Hosting** | Vercel        | Free tier (generous)                        |
| **Bot Hosting** | Fly.io        | 3 shared VMs free forever                   |
| **Database**    | Supabase      | 500MB database, 2GB bandwidth free          |
| **Auth**        | Supabase Auth | Included free with Supabase                 |

**Total Cost: $0/month**

---

## Step 1: Set Up Groq API (Free AI)

### Why Groq?

- ✅ Completely free (no credit card)
- ✅ Ultra-fast responses
- ✅ Good quality models (Llama, Mixtral)
- ✅ No rate limits (reasonable usage)

### Setup Steps:

1. **Sign Up for Groq**

   - Go to: https://console.groq.com
   - Sign up with email (no credit card needed)
   - Verify your email

2. **Get API Key**

   - Go to API Keys section
   - Create new API key
   - Copy the key (starts with `gsk_...`)

3. **Add to Environment Variables**
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   AI_PROVIDER=groq
   AI_MODEL=llama-3.1-70b-versatile
   ```

**Alternative: OpenAI (if you have free credits)**

- Sign up at https://platform.openai.com
- Get $5 free credit
- Use `gpt-4o-mini` model
- Add `OPENAI_API_KEY` to env vars

---

## Step 2: Set Up Supabase (Free Database)

### Why Supabase?

- ✅ Free tier: 500MB database, 2GB bandwidth
- ✅ Includes Auth (free)
- ✅ Perfect for MVP
- ✅ No credit card required initially

### Setup Steps:

1. **Sign Up for Supabase**

   - Go to: https://supabase.com
   - Sign up with GitHub (easiest)
   - Create new project

2. **Get Credentials**

   - Go to Project Settings > API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` key (keep secret!)

3. **Enable Auth**

   - Go to Authentication > Settings
   - Enable Email provider
   - (Optional) Disable email confirmation for MVP

4. **Add to Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

---

## Step 3: Set Up Vercel (Free Web Hosting)

### Why Vercel?

- ✅ Best Next.js hosting (made by Next.js creators)
- ✅ Generous free tier
- ✅ Automatic deployments from GitHub
- ✅ Free SSL, CDN, etc.

### Setup Steps:

1. **Sign Up for Vercel**

   - Go to: https://vercel.com
   - Sign up with GitHub
   - No credit card needed for free tier

2. **Deploy Your App**

   - Connect your GitHub repo
   - Vercel auto-detects Next.js
   - Add environment variables in dashboard
   - Deploy!

3. **Free Tier Limits:**
   - 100GB bandwidth/month (plenty for MVP)
   - Unlimited deployments
   - Free SSL certificate

---

## Step 4: Set Up Fly.io (Free Bot Hosting)

### Why Fly.io?

- ✅ 3 shared VMs free forever
- ✅ Always-on (no spin-down)
- ✅ Perfect for Discord bots
- ✅ No credit card required

### Setup Steps:

1. **Sign Up for Fly.io**

   - Go to: https://fly.io
   - Sign up with email
   - Install Fly CLI: `npm install -g @fly/cli`

2. **Login and Create App**

   ```bash
   fly auth login
   cd bot
   fly launch
   ```

3. **Set Environment Variables**

   ```bash
   fly secrets set DISCORD_BOT_TOKEN=your_token
   fly secrets set SUPABASE_URL=your_url
   fly secrets set GROQ_API_KEY=your_key
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

**Alternative: Render (Free Tier)**

- Sign up at https://render.com
- Create new Web Service
- Use UptimeRobot (free) to ping every 5 min to keep alive

---

## Step 5: Set Up Discord Bot

### Setup Steps:

1. **Create Discord Application**

   - Go to: https://discord.com/developers/applications
   - Create New Application
   - Go to Bot section
   - Create Bot
   - Copy Bot Token

2. **Invite Bot to Server**

   - Go to OAuth2 > URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Read Message History`
   - Copy invite URL and open it

3. **Add to Environment Variables**
   ```env
   DISCORD_BOT_TOKEN=your_bot_token
   DISCORD_CLIENT_ID=your_client_id
   ```

---

## Complete Environment Variables

### For Web App (.env.local):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider (Groq - Free)
GROQ_API_KEY=your_groq_api_key
AI_PROVIDER=groq
AI_MODEL=llama-3.1-70b-versatile

# Discord (for admin console display)
DISCORD_CLIENT_ID=your_client_id
```

### For Bot (.env):

```env
# Discord
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider (Groq - Free)
GROQ_API_KEY=your_groq_api_key
AI_PROVIDER=groq
AI_MODEL=llama-3.1-70b-versatile
```

---

## Free Tier Limits & Considerations

### Groq API

- ✅ Unlimited requests (reasonable usage)
- ✅ No credit card required
- ✅ Fast responses
- ⚠️ May have rate limits if abused

### Supabase

- ✅ 500MB database (plenty for MVP)
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users (Auth)
- ⚠️ May need to upgrade if you scale

### Vercel

- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Free SSL
- ⚠️ Functions timeout at 10s (not for bots)

### Fly.io

- ✅ 3 shared VMs free
- ✅ Always-on
- ✅ 160GB outbound data/month
- ⚠️ Shared resources (but fine for MVP)

---

## Cost Breakdown

| Service   | Free Tier       | Our Usage   | Cost         |
| --------- | --------------- | ----------- | ------------ |
| Groq API  | Unlimited       | MVP testing | **$0**       |
| Supabase  | 500MB DB        | MVP         | **$0**       |
| Vercel    | 100GB bandwidth | MVP         | **$0**       |
| Fly.io    | 3 VMs           | 1 bot       | **$0**       |
| **Total** |                 |             | **$0/month** |

---

## Troubleshooting Free Tiers

### If Groq Rate Limits:

- Use OpenAI free credits as backup
- Or implement request queuing

### If Supabase Hits Limits:

- Database: Optimize queries, add indexes
- Bandwidth: Cache responses, optimize API calls
- Users: Free tier supports 50K MAU (plenty for MVP)

### If Fly.io Resources Limited:

- Use Render free tier + UptimeRobot as backup
- Or run bot locally for testing

---

## Migration Path (If You Need to Scale)

All free services have paid tiers if you need to scale:

- **Groq** → Paid tier for higher limits
- **Supabase** → Pro tier ($25/month) for more resources
- **Vercel** → Pro tier ($20/month) for team features
- **Fly.io** → Paid VMs for dedicated resources

But for MVP and handoff, free tiers are perfect!

---

## ✅ Ready to Build for Free!

All services are set up and ready. You can build the entire project without spending a single dollar! 🎉

**Next:** Start Phase 1 implementation with these free services!
