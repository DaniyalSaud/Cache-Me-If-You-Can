// // src/utils/Gemini.utils.js
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";
// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const createPrompt = (question) => `
// You are an agricultural expert focused on Pakistan.
// Provide accurate, region-specific advice for Pakistani farmers.
// If relevant, mention local crops, seasons, irrigation, and fertilizer types.
// Use simple Urdu-friendly English for clarity.

// Question: ${question}
// `;

// const askGemini = async (question) => {
//   try {
//     // ✅ use new syntax and model
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = createPrompt(question);
//     const result = await model.generateContent(prompt);

//     // extract clean response
//     const text = result.response.text();
//     return text;
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     throw new Error("Failed to get response from Gemini");
//   }
// };

// import { GoogleGenerativeAI } from "@google/genai";
// import dotenv from "dotenv";
// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export const askGemini = async (question) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `
// You are an agricultural expert in Pakistan. 
// Answer clearly in simple English (Urdu-friendly). 
// Focus on Pakistani crops, soil, water, and weather context.

// Question: ${question}
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
//     return text;
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     throw new Error("Failed to get response from Gemini");
//   }
// };


// import { GoogleGenAI } from "@google/genai";
// import dotenv from "dotenv";
// dotenv.config();

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export const askGemini = async (question) => {
//   if (!question || typeof question !== "string") {
//     throw new Error("Question is required and must be a string");
//   }

//   try {
//     const prompt = `
// You are an agriculture expert in Pakistan.
// You answer in simple, Urdu-friendly English.
// Focus on Pakistani crops, soil, water, weather, and regional context.

// Question: ${question}
//     `;

//     const result = await ai.models.generateContent({
//       model: "gemini-2.0-flash-001",
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//     });

//     const text = result.response.text();
//     return text;
//   } catch (err) {
//     console.error("Gemini Error:", err);
//     throw new Error("Failed to get response from Gemini");
//   }
// };

// export default askGemini;

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const askGemini = async (question) => {
  if (!question || typeof question !== "string") {
    throw new Error("Question is required and must be a string");
  }

  try {
    const prompt = `
You are an agriculture expert in Pakistan.
You answer in simple, Urdu-friendly English.
Focus on Pakistani crops, soil, water, weather, and regional context.

Question: ${question}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // 🔍 Log the full structure to see where text actually is
    console.log("🔍 Gemini raw result:", JSON.stringify(result, null, 2));

    // Try all possible text locations
    const text =
      result.output_text ||
      result.output?.[0]?.content?.[0]?.text ||
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response text found.";

    return text.trim();
  } catch (err) {
    console.error("Gemini Error:", err);
    throw new Error("Failed to get response from Gemini");
  }
};

export default askGemini;


// import { GoogleGenAI } from "@google/genai";
// import dotenv from "dotenv";
// dotenv.config();

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export const askGemini = async (question) => {
//   if (!question || typeof question !== "string") {
//     throw new Error("Question is required and must be a string");
//   }

//   try {
//     const prompt = `
// You are an agriculture expert in Pakistan.
// You answer in simple, Urdu-friendly English.
// Focus on Pakistani crops, soil, water, weather, regions.

// Question: ${question}
//     `;

//     const result = await ai.models.generateContent({
//       model: "gemini-2.0-flash-001",
//       contents: prompt
//     });

//     const text = result.text();  
//     return text;
//   } catch (err) {
//     console.error("Gemini Error:", err);
//     throw new Error("Failed to get response from Gemini");
//   }
// };

// export default askGemini;