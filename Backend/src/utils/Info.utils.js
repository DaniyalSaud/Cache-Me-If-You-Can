import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const askGemini = async (question) => {
  if (!question || typeof question !== "string") {
    throw new Error("Question is required and must be a string");
  }

  try {
    const prompt = `
You are an agricultural expert in Pakistan.
You will answer clearly in simple, Urdu-friendly English.
Focus only on Pakistani crops, soil, water, and weather.
Keep your answer concise — **only 3 to 4 sentences** (short paragraph).
Avoid lists, bullet points, and unnecessary formatting.

Question: ${question}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text =
      result.output_text ||
      result.output?.[0]?.content?.[0]?.text ||
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response text found.";

    // 🧹 Clean up whitespace and extra line breaks
    return text.replace(/\n+/g, " ").trim();
  } catch (err) {
    console.error("Gemini Error:", err);
    throw new Error("Failed to get response from Gemini");
  }
};

export default askGemini;
