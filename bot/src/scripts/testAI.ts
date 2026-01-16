import "dotenv/config";
import { aiService } from "../services/aiService";

async function main() {
  console.log("Testing Gemini API...");
  const text = await aiService.generateResponse("Say hello in one sentence.");
  if (!text) {
    console.error("❌ Gemini returned no response");
    process.exit(1);
  }
  console.log("✅ Gemini response:\n", text);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
