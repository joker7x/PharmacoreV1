
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, LightDrug, DeepMarketAnalysis } from "../types.ts";

/**
 * Generates a medical quiz question using Gemini AI.
 * Follows the correct initialization and content generation patterns.
 */
export const generateMedicalQuestion = async (): Promise<QuizQuestion> => {
  // Directly access process.env.GEMINI_API_KEY as per guidelines.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackQuestion();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate one challenging multiple-choice medical question for a pharmacist in Arabic. Format as JSON with: question, options (4), correctAnswerIndex (0-3), explanation, points (10-50).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            points: { type: Type.INTEGER }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation", "points"]
        }
      }
    });

    // Access response.text directly (not a method).
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Gemini AI Quiz Generation Error:", e);
    return getFallbackQuestion();
  }
};

const getFallbackQuestion = (): QuizQuestion => ({
  question: "ما هو تصنيف دواء الميتفورمين (Metformin)؟",
  options: ["خافض للضغط", "منظم للسكر", "مضاد حيوي", "مسكن آلام"],
  correctAnswerIndex: 1,
  explanation: "الميتفورمين هو دواء من فئة البيغوانيد يستخدم كخط أول في علاج السكري من النوع الثاني.",
  points: 20
});

/**
 * Performs deep market analysis using Gemini Pro.
 * Utilizes a structured response schema for consistent results.
 */
export const analyzeFullMarketDeeply = async (allDrugs: LightDrug[], onProgress: (msg: string) => void): Promise<DeepMarketAnalysis> => {
    // Directly access process.env.GEMINI_API_KEY as per guidelines.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing API Key");
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        onProgress('تحليل سلوكيات الشركات...');
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `Analyze these drugs market sentiment: ${JSON.stringify(allDrugs.slice(0, 5))}. Return in Arabic JSON.`,
            config: { 
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  sentiment: { type: Type.STRING, description: 'General market sentiment in Arabic' },
                  trend: { type: Type.STRING, description: 'Identified market trend in Arabic' },
                  recommendation: { type: Type.STRING, description: 'Actionable recommendation in Arabic' }
                },
                required: ["sentiment", "trend", "recommendation"]
              }
            }
        });
        
        // Access response.text directly.
        const jsonStr = response.text?.trim() || "{}";
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Gemini AI Market Analysis Error:", e);
        throw new Error("Analysis Failed");
    }
};
