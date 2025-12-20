import { GoogleGenAI } from "@google/genai";
import { LightDrug, DeepMarketAnalysis } from "../types";
import { checkDrugAvailability } from "./tawreed";

// --- Advanced Types for Predictive Analysis ---
interface MarketSignal {
    name: string;
    marketPrice: number;
    officialPrice: number;
    quantity: number;
    gapPercent: number; // Difference between market and official price
}

// Helper to fetch live market data for a sample of drugs
const fetchLiveMarketSample = async (drugs: LightDrug[], sampleSize: number = 6): Promise<MarketSignal[]> => {
    const signals: MarketSignal[] = [];
    const sample = drugs.filter(d => d.p > 40 && d.p < 500).sort(() => 0.5 - Math.random()).slice(0, sampleSize);
    
    for (const drug of sample) {
        try {
            const marketData = await checkDrugAvailability(drug.n);
            if (marketData && marketData.length > 0) {
                const bestDeal = marketData[0];
                if (bestDeal.bestSale) {
                    signals.push({
                        name: drug.n,
                        marketPrice: bestDeal.bestSale,
                        officialPrice: drug.p,
                        quantity: bestDeal.totalQty,
                        gapPercent: parseFloat((((bestDeal.bestSale - drug.p) / drug.p) * 100).toFixed(1))
                    });
                }
            }
        } catch (e) { continue; }
    }
    return signals;
};

// Pre-calculate company behavior locally
const calculateCompanyMomentum = (drugs: LightDrug[]) => {
    const companyMap = new Map<string, {name:string, count:number, hikeCount:number, avgPrice:number}>();
    
    drugs.forEach(d => {
        const c = d.c.trim() || 'Unknown';
        if(!companyMap.has(c)) companyMap.set(c, {name:c, count:0, hikeCount:0, avgPrice:0});
        const stat = companyMap.get(c)!;
        stat.count++;
        stat.avgPrice += d.p;
        if(d.p > 100) stat.hikeCount++; 
    });

    const topCompanies = Array.from(companyMap.values())
        .filter(c => c.count > 10)
        .map(c => ({...c, ratio: Math.round((c.hikeCount/c.count)*100)}))
        .sort((a,b) => b.ratio - a.ratio)
        .slice(0, 8);
        
    return topCompanies;
};

export const analyzeFullMarketDeeply = async (allDrugs: LightDrug[], onProgress: (msg: string) => void): Promise<DeepMarketAnalysis & { volatilityScore: number }> => {
    try {
        // Correct initialization according to @google/genai guidelines using direct process.env.API_KEY
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        onProgress('تحليل سلوكيات الشركات ومؤشرات الزخم...');
        const aggressiveCompanies = calculateCompanyMomentum(allDrugs);

        onProgress('جاري سحب إشارات حية من السوق (Tawreed API)...');
        const marketSignals = await fetchLiveMarketSample(allDrugs, 5); 

        onProgress('معالجة البيانات في المحرك التنبؤي (Gemini 3)...');
        
        const prompt = `
            Act as a **Senior Pharmaceutical Market Strategist** in Egypt.
            I provide you with:
            1. **Archive Data Trends:** Companies aggressively pricing high-value items: ${JSON.stringify(aggressiveCompanies.map(c => `${c.name} (${c.ratio}% High Value)`))}
            2. **LIVE MARKET SIGNALS:** Real-time check of specific drugs: ${JSON.stringify(marketSignals)}
            
            **Signal Key:**
            - GapPercent > 0: Market price is higher than official (Inflationary pressure).
            - Low Quantity: Scarcity risk.
            
            **YOUR MISSION:**
            Generate a "Procurement Forecast".
            - Identify items to **STOCKPILE** (Buy now before price hike).
            - Identify **VOLATILE** items (Price changing rapidly).
            - Identify **SCARCE** classes based on the market signals.

            **Output JSON:**
            {
                "reportDate": "YYYY-MM-DD",
                "marketSentiment": "bullish" | "bearish" | "volatile",
                "volatilityScore": Number (0-100),
                "executiveSummary": "Arabic strategic advice. Reference specific signals.",
                "buyOpportunities": [
                    { "name": "Drug Name", "reason": "Detailed Arabic reason.", "urgency": "high" | "medium" }
                ],
                "companyAnalysis": [
                    { "name": "Company Name", "inflationRate": Number (0-100), "strategy": "Arabic insight" }
                ],
                "shortageWarnings": [
                    { "category": "Therapeutic Class", "riskLevel": "high", "reason": "Arabic reason" }
                ]
            }
        `;

        // Using gemini-3-pro-preview for complex market analysis tasks as per guidelines
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if(text) return JSON.parse(text) as DeepMarketAnalysis & { volatilityScore: number };
        throw new Error("AI returned empty");
    } catch (e) {
        console.error("Deep Scan Failed", e);
        throw e;
    }
};

export interface DrugStrategyResult {
    advice: "buy" | "sell" | "hold";
    reason: string;
    riskLevel: "high" | "medium" | "low";
}

export const analyzeSingleDrugStrategy = async (name: string, price: number, company: string, marketAvailability: string): Promise<DrugStrategyResult> => {
    try {
        // Correct initialization according to @google/genai guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const prompt = `
            Act as a Pharmacy Inventory Consultant in Egypt.
            Drug: ${name}
            Price: ${price} EGP
            Company: ${company}
            Market Availability: ${marketAvailability}

            Evaluate this specific item for a pharmacy's stock.
            Output JSON:
            {
                "advice": "buy" | "sell" | "hold",
                "reason": "Professional Arabic advice.",
                "riskLevel": "high" | "medium" | "low"
            }
        `;

        // Using gemini-3-pro-preview for complex reasoning task as per guidelines
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json" 
            }
        });

        const text = response.text;
        if(text) return JSON.parse(text) as DrugStrategyResult;
        throw new Error("AI Empty");
    } catch (e) {
        return { advice: "hold", reason: "فشل التحليل الذكي", riskLevel: "low" };
    }
};