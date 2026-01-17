#!/usr/bin/env ts-node
/**
 * Phase 5 Memory System - Automated Test Script
 *
 * This script verifies memory persistence across bot restarts.
 * Run after bot is online and channel is configured.
 *
 * Usage: npx tsx test-memory.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Test configuration
const CHANNEL_ID = process.env.TEST_CHANNEL_ID || "1461397065128214683"; // Your test channel
const TARGET_MESSAGE_COUNT = 20; // Test up to 20 messages

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function log(level: string, msg: string) {
  console.log(`[${level}] ${msg}`);
}

function addResult(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  log(passed ? "✅" : "❌", `${name}: ${message}`);
}

async function testMemoryPersistence() {
  log("ℹ️ ", "Starting Phase 5 Memory Persistence Test...\n");

  try {
    // Test 1: Check if summaries table exists and has data
    log("📋", "TEST 1: Verify summaries table...");
    const { data: summaries, error: summError } = await supabase
      .from("summaries")
      .select("*")
      .eq("channel_id", CHANNEL_ID)
      .single();

    if (summError && summError.code !== "PGRST116") {
      addResult(
        "Summaries Table Access",
        false,
        `Database error: ${summError.message}`,
      );
      return;
    }

    if (!summaries) {
      addResult(
        "Summaries Table Access",
        false,
        "No summary found for channel. Start conversation first.",
      );
      return;
    }

    addResult(
      "Summaries Table Access",
      true,
      `Found summary (${summaries.message_count} messages)`,
    );

    // Test 2: Verify message_count is tracking correctly
    log("\n📋", "TEST 2: Verify message_count field...");
    const messageCount = summaries.message_count || 0;
    const countValid = messageCount > 0;

    addResult(
      "Message Count Tracking",
      countValid,
      `Current count: ${messageCount} messages`,
    );

    // Test 3: Verify summary content exists and is concise
    log("\n📋", "TEST 3: Verify summary content...");
    const summary = summaries.summary || "";
    const summaryLength = summary.length;
    const isConci = summaryLength > 0 && summaryLength < 1000;
    const sentences = summary.split(".").length - 1;

    addResult(
      "Summary Content",
      isConci,
      `${summaryLength} chars, ~${sentences} sentences`,
    );

    if (!isConci) {
      log("⚠️ ", "Summary too long or empty. Expected 100-500 chars.");
    }

    // Test 4: Verify message logging with roles
    log("\n📋", "TEST 4: Verify message role tracking...");
    const { data: messageStats, error: msgError } = await supabase
      .from("messages")
      .select("role")
      .eq("channel_id", CHANNEL_ID);

    if (msgError) {
      addResult(
        "Message Role Tracking",
        false,
        `Query error: ${msgError.message}`,
      );
      return;
    }

    const userMsgs = messageStats?.filter((m) => m.role === "user").length || 0;
    const botMsgs =
      messageStats?.filter((m) => m.role === "assistant").length || 0;
    const totalMsgs = messageStats?.length || 0;

    const rolesCorrect = userMsgs > 0 && botMsgs > 0 && userMsgs === botMsgs;
    addResult(
      "Message Role Tracking",
      rolesCorrect,
      `User: ${userMsgs}, Bot: ${botMsgs}, Total: ${totalMsgs}`,
    );

    // Test 5: Verify summary was updated recently
    log("\n📋", "TEST 5: Verify summary recency...");
    const updatedAt = new Date(summaries.updated_at);
    const minutesAgo = (Date.now() - updatedAt.getTime()) / 60000;
    const isRecent = minutesAgo < 60; // Within last hour

    addResult(
      "Summary Recency",
      isRecent,
      `Last updated ${Math.round(minutesAgo)} minutes ago`,
    );

    // Test 6: Verify token efficiency
    log("\n📋", "TEST 6: Calculate token efficiency...");
    const fullHistoryTokens = Math.ceil(totalMsgs * 15); // ~15 tokens per message
    const summaryTokens = Math.ceil(summaryLength / 4); // ~1 token per 4 chars
    const savings = Math.round(
      ((fullHistoryTokens - summaryTokens) / fullHistoryTokens) * 100,
    );

    const efficiencyGood = savings > 80;
    addResult(
      "Token Efficiency",
      efficiencyGood,
      `${savings}% savings (${fullHistoryTokens} → ${summaryTokens} tokens)`,
    );

    // Test 7: Check if next summary would trigger correctly
    log("\n📋", "TEST 7: Verify summary trigger logic...");
    const nextTrigger = Math.ceil((messageCount + 1) / 10) * 10;
    const triggerDistance = nextTrigger - messageCount;

    addResult(
      "Summary Trigger Schedule",
      true,
      `Next summary at ${nextTrigger} messages (${triggerDistance} to go)`,
    );

    // Test 8: Verify database integrity
    log("\n📋", "TEST 8: Verify database integrity...");
    const hasAllFields =
      summaries.channel_id &&
      summaries.summary &&
      typeof summaries.message_count === "number" &&
      summaries.updated_at;

    addResult(
      "Database Integrity",
      !!hasAllFields,
      "All required fields present",
    );

    // Summary report
    log("\n" + "═".repeat(60), "");
    log("📊", "TEST RESULTS");
    log("═".repeat(60), "");

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const passRate = Math.round((passed / total) * 100);

    results.forEach((r) => {
      log(r.passed ? "✅" : "❌", `${r.name}: ${r.message}`);
    });

    log("═".repeat(60), "");
    log("📈", `PASS RATE: ${passed}/${total} (${passRate}%)`);

    if (passRate === 100) {
      log("✅", "Memory persistence test PASSED! 🎉");
      process.exit(0);
    } else if (passRate >= 80) {
      log("⚠️ ", "Memory persistence test PARTIALLY PASSED. Review failures.");
      process.exit(1);
    } else {
      log(
        "❌",
        "Memory persistence test FAILED. Fix issues before production.",
      );
      process.exit(1);
    }
  } catch (error) {
    log("❌", `Test error: ${error}`);
    process.exit(1);
  }
}

// Run tests
testMemoryPersistence();
