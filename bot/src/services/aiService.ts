import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

export const aiService = {
  /**
   * Generate a response from Gemini API using official SDK
   * @param prompt - The full prompt with context
   * @returns Generated response text or null if failed
   */
  async generateResponse(prompt: string): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY) {
      logger.error("GEMINI_API_KEY not configured");
      return null;
    }

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        logger.warn("No text content in Gemini response");
        return null;
      }

      return text;
    } catch (error) {
      logger.error(`Failed to call Gemini API: ${error}`);
      return null;
    }
  },
};
