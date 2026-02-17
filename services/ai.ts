
import { GoogleGenAI, Type } from "@google/genai";
import { LightDrug, DeepMarketAnalysis, QuizQuestion } from "../types.ts";

export const generateMedicalQuestion = async (): Promise<QuizQuestion> => {
  const apiKey = (window as any).process?.env?.API_KEY || "";
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

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Gemini AI Error:", e);
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

export const analyzeFullMarketDeeply = async (allDrugs: LightDrug[], onProgress: (msg: string) => void): Promise<DeepMarketAnalysis> => {
    const apiKey = (window as any).process?.env?.API_KEY || "";
    try {
        const ai = new GoogleGenAI({ apiKey });
        onProgress('تحليل سلوكيات الشركات...');
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Analyze these drugs market sentiment: ${JSON.stringify(allDrugs.slice(0, 5))}. Return in Arabic JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        throw new Error("Analysis Failed");
    }
};
