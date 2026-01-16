# Step-by-Step Implementation Guide: Memory Persistence Test

## Overview

This guide walks you through implementing and running a complete memory persistence test for Phase 5.

---

## Part 1: Preparation (5 minutes)

### Step 1.1: Verify Bot is Running

```bash
# Terminal 1: Start bot
cd c:\Users\shrin\Desktop\discord-ai-copilot\discord-ai-copilot\bot
npm run dev
```

**Expected Output:**

```
> discord-bot@1.0.0 dev
> tsx watch src/index.ts

[ℹ️  INFO] [2026-01-16T08:15:30.123Z] ✅ Bot logged in as Ai-Copilot-bot#87117
```

### Step 1.2: Verify Supabase Connection

```bash
# Terminal 2: Test Supabase queries
cd c:\Users\shrin\Desktop\discord-ai-copilot\discord-ai-copilot\bot
npm run test:ai
```

**Expected Output:**

```
Testing Gemini API...
[✅] Connection successful
[✅] Response: [Some test response]
```

### Step 1.3: Clear Previous Test Data (Optional)

```sql
-- Run in Supabase SQL Editor

-- Delete test messages from previous runs
DELETE FROM messages
WHERE channel_id = '1461397065128214683'
AND created_at > now() - interval '1 hour';

-- Delete test summary
DELETE FROM summaries
WHERE channel_id = '1461397065128214683'
AND updated_at > now() - interval '1 hour';

-- Verify clean state
SELECT COUNT(*) as message_count FROM messages
WHERE channel_id = '1461397065128214683';

SELECT message_count FROM summaries
WHERE channel_id = '1461397065128214683';
```

---

## Part 2: Phase 1 - Initial Conversation (10 minutes)

### Step 2.1: Send First Message

**In Discord (your test channel):**

```
User: "I'm working on a Node.js project with TypeScript"
```

**Expected Bot Behavior:**

- Bot replies with helpful response
- Checks logs for: `Processing message from <your-username>`

**Check Bot Logs:**

```
[ℹ️  INFO] Processing message from anshmeshram0044 in channel=1461397065128214683
[✅ SUCCESS] Replied in channel=1461397065128214683
[ℹ️  INFO] Message count incremented to 2 for channel=1461397065128214683
[ℹ️  INFO] Summary trigger not yet reached: 2 messages
```

### Step 2.2: Continue Conversation (4 more exchanges = 10 messages total)

**Exchange 2:**

```
User: "Should I use express or fastify?"
Bot: [Response...]
```

**Exchange 3:**

```
User: "Which one is faster?"
Bot: [Response...]
```

**Exchange 4:**

```
User: "What about security features?"
Bot: [Response...]
```

**Exchange 5:**

```
User: "Can you compare them side by side?"
Bot: [Response...]
```

**After Exchange 5 (10 total messages):**

**Expected Logs:**

```
[ℹ️  INFO] Message count incremented to 10 for channel=1461397065128214683
[ℹ️  INFO] Summary trigger activated at message_count=10
[ℹ️  INFO] Summary updated: 285 chars
[✅ SUCCESS] Summary updated and stored at message_count=10
```

### Step 2.3: Verify Summary in Supabase

**Run SQL Query:**

```sql
SELECT
  channel_id,
  message_count,
  LENGTH(summary) as summary_length,
  summary,
  updated_at
FROM summaries
WHERE channel_id = '1461397065128214683'
ORDER BY updated_at DESC
LIMIT 1;
```

**Expected Result:**

```
channel_id: 1461397065128214683
message_count: 10
summary_length: 285
summary: "User is working on Node.js project in TypeScript. Discussing framework choice between express and fastify, comparing performance and security features."
updated_at: 2026-01-16 08:25:30+00
```

**Verify Message Count:**

```sql
SELECT
  role,
  COUNT(*) as count
FROM messages
WHERE channel_id = '1461397065128214683'
GROUP BY role
ORDER BY role;
```

**Expected Result:**

```
role | count
-----|-------
user | 5
assistant | 5
```

---

## Part 3: Bot Restart (2 minutes)

### Step 3.1: Stop Bot

**In Terminal 1 (where bot is running):**

```
Press Ctrl+C
```

**Expected Output:**

```
^C
[ℹ️  INFO] Bot process terminated
```

Wait 2 seconds to ensure full shutdown.

### Step 3.2: Verify Data Persisted in Supabase

**Run SQL Query:**

```sql
SELECT COUNT(*) as total_messages FROM messages
WHERE channel_id = '1461397065128214683';
```

**Expected Result:**

```
total_messages: 10
```

**Verify Summary Still Exists:**

```sql
SELECT message_count, summary FROM summaries
WHERE channel_id = '1461397065128214683';
```

**Expected Result:**

```
message_count: 10
summary: "User is working on Node.js..." (same as before)
```

### Step 3.3: Restart Bot

**In Terminal 1:**

```bash
npm run dev
```

**Expected Output:**

```
> discord-bot@1.0.0 dev
> tsx watch src/index.ts

[ℹ️  INFO] [2026-01-16T08:30:45.123Z] ✅ Bot logged in as Ai-Copilot-bot#87117
```

---

## Part 4: Resume Conversation with Context (10 minutes)

### Step 4.1: Send Message After Restart

**In Discord:**

```
User: "Which one has better middleware ecosystem?"
```

**Expected Bot Behavior:**

- Bot loads summary from database
- Uses summary in prompt context
- Response acknowledges previous context

**Check Bot Logs:**

```
[ℹ️  INFO] Processing message from anshmeshram0044 in channel=1461397065128214683
[ℹ️  INFO] Message count incremented to 12 for channel=1461397065128214683
[ℹ️  INFO] Summary trigger not yet reached: 12 messages (next at 10, 20, 30...)
```

**Verify Summary in Prompt (Advanced):**
Add this to messageHandler.ts temporarily:

```typescript
logger.info(
  `[DEBUG] Summary loaded: ${summary?.summary?.substring(0, 100)}...`
);
```

### Step 4.2: Continue Conversation (4 more exchanges = 20 messages total)

**Exchange 6:**

```
User: "What about community support?"
Bot: [Response...]
```

**Exchange 7:**

```
User: "Which is better for production?"
Bot: [Response...]
```

**Exchange 8:**

```
User: "Any gotchas I should know about?"
Bot: [Response...]
```

**Exchange 9:**

```
User: "Thanks for the detailed comparison!"
Bot: [Response...]
```

**After Exchange 9 (20 total messages):**

**Expected Logs:**

```
[ℹ️  INFO] Message count incremented to 20 for channel=1461397065128214683
[ℹ️  INFO] Summary trigger activated at message_count=20
[ℹ️  INFO] Summary updated: 312 chars
[✅ SUCCESS] Summary updated and stored at message_count=20
```

### Step 4.3: Verify Updated Summary

**Run SQL Query:**

```sql
SELECT
  message_count,
  LENGTH(summary) as summary_length,
  summary,
  updated_at
FROM summaries
WHERE channel_id = '1461397065128214683'
ORDER BY updated_at DESC
LIMIT 1;
```

**Expected Result:**

```
message_count: 20
summary_length: 312
summary: "User working on Node.js TypeScript project. Compared express vs fastify frameworks on performance, security, middleware ecosystem, and production readiness. Fastify has better modern features, express has larger community."
updated_at: 2026-01-16 08:45:20+00
```

**Verify Total Messages:**

```sql
SELECT
  role,
  COUNT(*) as count
FROM messages
WHERE channel_id = '1461397065128214683'
GROUP BY role
ORDER BY role;
```

**Expected Result:**

```
role | count
-----|-------
user | 10
assistant | 10
```

---

## Part 5: Run Automated Test (2 minutes)

### Step 5.1: Execute Test Script

**In Terminal 3:**

```bash
cd c:\Users\shrin\Desktop\discord-ai-copilot\discord-ai-copilot\bot
npm run test:memory
```

**Expected Output:**

```
[ℹ️] Starting Phase 5 Memory Persistence Test...

[✅] Summaries Table Access: Found summary (20 messages)
[✅] Message Count Tracking: Current count: 20 messages
[✅] Summary Content: 312 chars, ~4 sentences
[✅] Message Role Tracking: User: 10, Bot: 10, Total: 20
[✅] Summary Recency: Last updated 5 minutes ago
[✅] Token Efficiency: 88% savings (300 → 36 tokens)
[✅] Summary Trigger Schedule: Next summary at 30 messages (10 to go)
[✅] Database Integrity: All required fields present

═══════════════════════════════════════════════════════════
📈 PASS RATE: 8/8 (100%)
✅ Memory persistence test PASSED! 🎉
═══════════════════════════════════════════════════════════
```

---

## Part 6: Verify Admin Dashboard (Optional)

### Step 6.1: Access Admin Memory Page

**Open in Browser:**

```
http://localhost:3000/admin/memory
```

**Expected Display:**

```
Memory System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Channel: general (1461397065128214683)
Server: 1461397064108867698

Message Count: 20
Last Updated: 2026-01-16 08:45:20

Summary:
"User working on Node.js TypeScript project. Compared
express vs fastify frameworks on performance, security,
middleware ecosystem, and production readiness. Fastify
has better modern features, express has larger community."

Status: ✅ Active
```

---

## Part 7: Troubleshooting

### Issue: Summary Not Generated at Message 10

**Debug Steps:**

```bash
# 1. Check bot logs for errors
grep "ERROR" logs.txt
grep "Summary trigger" logs.txt

# 2. Verify message_count in database
SELECT message_count FROM summaries
WHERE channel_id = '1461397065128214683';

# 3. Check if Gemini API is responding
npm run test:ai

# 4. Verify shouldGenerateSummary logic
# In memoryService.ts, check: messageCount % 10 === 0
```

### Issue: Bot Doesn't Use Summary After Restart

**Debug Steps:**

```sql
-- 1. Verify summary exists
SELECT summary FROM summaries
WHERE channel_id = '1461397065128214683';

-- 2. Check if summary is NULL
SELECT
  channel_id,
  summary IS NULL as is_null,
  LENGTH(summary) as length
FROM summaries
WHERE channel_id = '1461397065128214683';
```

### Issue: Message Count Not Incrementing

**Debug Steps:**

```bash
# 1. Check incrementMessageCount function
grep "incrementMessageCount" bot/src/lib/queries.ts

# 2. Verify upsert is working
SELECT message_count FROM summaries
WHERE channel_id = '1461397065128214683';

# 3. Check for database write errors in logs
grep "Failed to update" logs.txt
```

---

## Success Checklist

- [ ] Bot logs in successfully
- [ ] First 10 messages trigger summary generation
- [ ] Summary appears in Supabase within 30 seconds
- [ ] Bot restarts without errors
- [ ] Data persists in Supabase after restart
- [ ] Messages 11-20 are logged correctly
- [ ] Second summary generates at message 20
- [ ] Updated summary reflects both phases
- [ ] Automated test passes (8/8)
- [ ] Admin dashboard displays summary
- [ ] Message count shows 20
- [ ] Role tracking accurate (10 user, 10 assistant)

---

## Timeline Summary

```
0 min   → Bot starts, logs in
0-10 min → Send 5 exchanges (10 messages)
10 min  → Summary generated at message 10
11 min  → Verify in Supabase ✓
12 min  → Stop bot (Ctrl+C)
13 min  → Verify data persisted ✓
14 min  → Restart bot
15 min  → Send message 11 (uses summary)
15-20 min → Send 4 more exchanges (20 messages total)
20 min  → Summary generated at message 20
21 min  → Verify updated summary ✓
22 min  → Run automated test
23 min  → All tests pass ✓
```

---

## Key Commands Reference

```bash
# Start bot
npm run dev

# Run automated test
npm run test:memory

# Test AI connectivity
npm run test:ai

# View logs (while bot running)
npm run dev 2>&1 | tee bot.log
```

---

## Expected Results by Phase

### Phase 1 (Messages 1-10)

- ✅ User/bot exchange 5 times
- ✅ Summary generated automatically at message 10
- ✅ Summary stored in Supabase
- ✅ Message count = 10

### Phase 2 (Restart)

- ✅ Bot stops cleanly
- ✅ Data persists in database
- ✅ Bot restarts successfully
- ✅ No errors in logs

### Phase 3 (Messages 11-20)

- ✅ Resume from message 11
- ✅ Bot loads and uses summary from database
- ✅ Conversation context flows naturally
- ✅ Summary updated at message 20
- ✅ Updated summary includes both phases

### Phase 4 (Verification)

- ✅ Automated test passes
- ✅ 8/8 assertions pass
- ✅ 100% pass rate
- ✅ Admin dashboard synced

---

This completes the full memory persistence test! 🎉
