
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFitnessRecommendation = async (userInput: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User asks: "${userInput}". 
      You are the Dstars AI Fitness Concierge. Dstars is a premium, minimal, high-end gym.
      Recommend a membership or training path based on their goal. 
      Keep it professional, encouraging, and succinct (max 2 sentences).`,
      config: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 100
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to the concierge service. Please visit our front desk for assistance.";
  }
};
