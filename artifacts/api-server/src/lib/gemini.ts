import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL;

if (!GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is required. Set it in your environment variables.",
  );
}

export const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  ...(GEMINI_BASE_URL
    ? { httpOptions: { apiVersion: "", baseUrl: GEMINI_BASE_URL } }
    : {}),
});
