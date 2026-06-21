import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL;

let _ai: GoogleGenAI | null = null;

/** Lazy-initialised Gemini client. Throws on first use if GEMINI_API_KEY is not set. */
export function getAI(): GoogleGenAI {
  if (_ai) return _ai;
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is required. Set it in your environment variables.",
    );
  }
  _ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    ...(GEMINI_BASE_URL
      ? { httpOptions: { apiVersion: "", baseUrl: GEMINI_BASE_URL } }
      : {}),
  });
  return _ai;
}

/** @deprecated use getAI() instead */
export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    return (getAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
