# Phase 5 Memory System - Persistence Test Guide

## Objective

Verify that conversation summaries persist across bot restarts and are used correctly in subsequent interactions.

---

## Test Scenario: Memory Persistence Across Restart

### Prerequisites

✅ Bot is running and authenticated
✅ Channel is in allow-list
✅ Gemini API quota is available (or mock responses)
✅ Supabase connection validated

---

## Step-by-Step Test Procedure

### PHASE 1: Initial Conversation (Messages 1-10)

**Step 1.1: Send first user message**

```
User: "I'm working on a Discord bot project using TypeScript"
```

- **Expected:**
  - Bot replies with helpful response
  - Logs: `Processing message from <username> in channel=<id>`
  - No summary generated yet (message_count = 1)

**Step 1.2: Bot replies**

- **Check in logs:**
  ```
  Message count incremented to 2 for channel=<id>
  Summary trigger not yet reached: 2 messages
  ```

**Step 1.3: Continue conversation (8 more exchanges)**

```
User: "What framework should I use?"
Bot: [Response]
User: "Should I use Discord.js v14?"
Bot: [Response]
... (4 more exchanges to reach 10 total messages)
```

**Step 1.4: Verify 10th message triggers summary**

- Send 10th message (5th user message + 5th bot reply)
- **Expected logs:**
  ```
  Message count incremented to 10 for channel=<id>
  Summary trigger activated at message_count=10
  Summary updated: <length> chars
  Summary updated and stored at message_count=10
  ```

**Step 1.5: Verify summary in Supabase**

```sql
SELECT channel_id, message_count, summary, updated_at
FROM summaries
WHERE channel_id = '1461397065128214683'
LIMIT 1;
```

- **Expected:**
  - `message_count` = 10
  - `summary` contains factual info: "User is working on Discord bot in TypeScript"
  - `updated_at` is recent (within last minute)
  - `summary` is 2-4 sentences, no markdown

**Verification Queries:**

```sql
-- Verify message count
SELECT COUNT(*) as total_messages,
       SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_msgs,
       SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END) as bot_msgs
FROM messages
WHERE channel_id = '1461397065128214683';

-- Expected: total=10, user_msgs=5, bot_msgs=5

-- Verify role tracking
SELECT role, COUNT(*) FROM messages
WHERE channel_id = '1461397065128214683'
GROUP BY role;

-- Expected: user=5, assistant=5
```

---

### PHASE 2: Bot Restart

**Step 2.1: Stop bot**

```bash
# In terminal, press Ctrl+C to stop the bot
```

- **Expected:**
  - Bot logs "Bot logged in" disappears
  - No new messages processed
  - All data persisted in Supabase

**Step 2.2: Verify data persisted**

```sql
-- Check all data still exists
SELECT COUNT(*) as msg_count FROM messages
WHERE channel_id = '1461397065128214683';
-- Expected: 10

SELECT summary FROM summaries
WHERE channel_id = '1461397065128214683';
-- Expected: Summary text is present
```

**Step 2.3: Restart bot**

```bash
npm run dev
```

- **Expected:**
  - Bot logs: `✅ Bot logged in as Ai-Copilot-bot#<id>`
  - No errors during startup
  - Bot ready to process messages

---

### PHASE 3: Resume Conversation (Messages 11-20)

**Step 3.1: Send 11th message**

```
User: "How do I handle events in Discord.js?"
```

**Step 3.2: Verify summary is loaded**

- **Check logs:**
  ```
  Processing message from <username> in channel=<id> base=<id>
  Conversation Context:
  Long-term Summary (rolling context to save tokens):
  User is working on Discord bot in TypeScript...
  ```
- **Expected:**
  - The summary from PHASE 1 appears in the prompt
  - Bot uses that context to respond appropriately
  - Response acknowledges previous context: "Based on your TypeScript Discord bot project..."

**Step 3.3: Continue conversation to 20 messages**

```
User: "How do I handle events?"
Bot: [Response using summary context]
User: "What about error handling?"
Bot: [Response]
... (4 more exchanges)
```

**Step 3.4: Verify 20th message triggers second summary**

- **Expected logs:**
  ```
  Message count incremented to 20 for channel=<id>
  Summary trigger activated at message_count=20
  Summary updated and stored at message_count=20
  ```

**Step 3.5: Verify updated summary**

```sql
SELECT channel_id, message_count, summary, updated_at
FROM summaries
WHERE channel_id = '1461397065128214683';
```

- **Expected:**
  - `message_count` = 20
  - `summary` now includes info from both PHASE 1 and PHASE 3
  - Example: "User building Discord bot in TypeScript using Discord.js v14. Discussed framework selection, event handling, and error patterns."
  - `updated_at` is newer than PHASE 1 timestamp

---

### PHASE 4: Verify No Raw Message Leakage

**Step 4.1: Check message count vs summary**

```sql
-- Count total messages logged
SELECT COUNT(*) as logged_messages
FROM messages
WHERE channel_id = '1461397065128214683';
-- Expected: 20

-- Check summary still concise (no full history dumped)
SELECT LENGTH(summary) as summary_length,
       message_count,
       SUBSTR(summary, 1, 200) as preview
FROM summaries
WHERE channel_id = '1461397065128214683';
-- Expected: summary_length ~100-300 chars, message_count=20
```

**Step 4.2: Verify memory efficiency**

- Full 20-message history: ~1500-2000 tokens
- Rolling summary: ~40-60 tokens
- **Token Savings:** ~95% reduction
- **Cost Savings:** ~95% reduction in API calls

---

## Expected Test Results Summary

| Phase | Metric              | Expected        | Status |
| ----- | ------------------- | --------------- | ------ |
| **1** | Messages logged     | 10              | ✅     |
| **1** | Summary generated   | Yes (at msg 10) | ✅     |
| **1** | Summary concise     | 2-4 sentences   | ✅     |
| **2** | Data after restart  | All present     | ✅     |
| **3** | Summary loaded      | Yes, in prompt  | ✅     |
| **3** | Messages logged     | 20 total        | ✅     |
| **3** | Summary updated     | Yes (at msg 20) | ✅     |
| **4** | No raw history leak | Summary only    | ✅     |
| **4** | Token efficiency    | ~95% savings    | ✅     |

---

## Admin Dashboard Verification

### Memory Page Should Show

**Before Restart:**

```
Channel: general
Message Count: 10
Last Updated: 2026-01-16 08:15:00
Summary: "User is working on Discord bot..."
```

**After Restart + 10 more messages:**

```
Channel: general
Message Count: 20
Last Updated: 2026-01-16 08:25:30
Summary: "User building Discord bot in TypeScript... [extended summary]"
```

### API Response Check

```bash
curl http://localhost:3000/api/memory
# Expected: Returns all summaries with message_count, updated_at
```

---

## Troubleshooting

### Symptom: Summary not generated at message 10

**Possible Causes:**

- Gemini API quota exhausted
- `incrementMessageCount()` not called
- `shouldGenerateSummary()` returning false
- Database write failed silently

**Debug Steps:**

```bash
# Check logs for errors
grep "Summary trigger" logs.txt
grep "ERROR" logs.txt
grep "message_count" logs.txt

# Verify database
SELECT message_count FROM summaries WHERE channel_id='<id>';
```

### Symptom: Bot doesn't use summary after restart

**Possible Causes:**

- Summary not retrieved from database
- Prompt not including summary
- Summary field is NULL

**Debug Steps:**

```bash
# Check summary exists
SELECT summary FROM summaries WHERE channel_id='<id>';

# Check recent messages include context
SELECT content FROM messages WHERE channel_id='<id>' ORDER BY created_at DESC LIMIT 5;

# Check logs for prompt building
grep "CONVERSATION CONTEXT" logs.txt
```

### Symptom: Old summary not updated

**Possible Causes:**

- `updateConversationSummary()` failed
- Message count increment failed
- Upsert conflict

**Debug Steps:**

```sql
-- Check updated_at timestamp
SELECT updated_at FROM summaries WHERE channel_id='<id>';

-- Verify upsert is working
UPDATE summaries SET message_count = message_count + 2
WHERE channel_id = '1461397065128214683';
```

---

## Success Criteria ✅

- ✅ Bot generates summary at messages 10, 20, 30...
- ✅ Summary persists across restart
- ✅ Summary is loaded and used in subsequent messages
- ✅ Bot responses acknowledge previous context
- ✅ No raw full history is stored (only summaries)
- ✅ Token efficiency achieved (~95% savings)
- ✅ Admin dashboard displays accurate summaries
- ✅ No errors in logs during entire test
- ✅ Message count increments correctly
- ✅ Role tracking (user/assistant) is accurate

---

## Running the Full Test

```bash
# Terminal 1: Run bot
cd bot
npm run dev

# Terminal 2: Monitor logs
tail -f bot-logs.txt

# Terminal 3: Run test messages (manually or via script)
# Send messages in Discord channel
```

**Estimated Duration:** 5-10 minutes (depending on API response speed)

---

## Notes

- Tests should use the same Discord channel/server throughout
- Wait 1-2 seconds between messages for consistent timestamps
- Monitor Supabase dashboard for real-time updates
- Check bot logs for any warnings or errors
- Use `/api/memory` endpoint to verify admin dashboard sync
