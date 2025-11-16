import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;

export const MODELS = {
  LLAMA_70B: "llama-3.3-70b-versatile",
  MIXTRAL: "mixtral-8x7b-32768",
} as const;
