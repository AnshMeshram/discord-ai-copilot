import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  // The SDK exposes a models client via REST helper
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );
  const data = await resp.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error("❌ Failed to list models:", err);
  process.exit(1);
});
