
import { GoogleGenAI } from "@google/genai";
import { LightDrug, DeepMarketAnalysis } from "../types";
import { checkDrugAvailability } from "./tawreed";

export const analyzeFullMarketDeeply = async (allDrugs: LightDrug[], onProgress: (msg: string) => void): Promise<DeepMarketAnalysis & { volatilityScore: number }> => {
    try {
        // الاستخدام الصحيح للمكتبة حسب الدليل
        // Fix: Use process.env.API_KEY directly as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        onProgress('تحليل سلوكيات الشركات...');
        
        const prompt = `
            Act as a Senior Pharmaceutical Market Strategist in Egypt.
            Analyze the market behavior for these drugs: ${JSON.stringify(allDrugs.slice(0, 10))}
            Provide a JSON report with: reportDate, marketSentiment, volatilityScore (0-100), executiveSummary (Arabic), 
            buyOpportunities (name, reason in Arabic, urgency), companyAnalysis, and shortageWarnings.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if(text) return JSON.parse(text);
        throw new Error("AI returned empty");
    } catch (e) {
        console.error("Deep Scan Failed", e);
        throw e;
    }
};

export const analyzeSingleDrugStrategy = async (name: string, price: number, company: string, marketAvailability: string): Promise<any> => {
    try {
        // Fix: Use process.env.API_KEY directly as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            Evaluate this drug for pharmacy inventory: ${name}, Price: ${price}, Company: ${company}.
            Market Status: ${marketAvailability}.
            Return JSON: { advice: "buy"|"sell"|"hold", reason: "Arabic string", riskLevel: "high"|"medium"|"low" }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json" 
            }
        });

        const text = response.text;
        if(text) return JSON.parse(text);
        throw new Error("AI Empty");
    } catch (e) {
        return { advice: "hold", reason: "الخدمة غير متوفرة حالياً", riskLevel: "low" };
    }
};
