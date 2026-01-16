import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "models/text-embedding-004";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function embedText(text: string): Promise<number[] | null> {
  const clean = text?.trim();
  if (!clean) return null;
  if (!genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.embedContent(clean);
    const vector = result.embedding?.values;
    if (!vector || vector.length === 0) return null;
    return vector;
  } catch (error) {
    console.error("Failed to embed text", error);
    return null;
  }
}
