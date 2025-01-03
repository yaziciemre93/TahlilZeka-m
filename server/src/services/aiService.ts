import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

// Ensure environment variables are loaded
const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

const API_KEY = process.env.OPENAI_API_KEY;
console.log("aiService.ts - Environment Check:");
console.log("- Current directory:", process.cwd());
console.log("- Env path:", envPath);
console.log("- API Key exists:", !!API_KEY);
console.log("- First few characters:", API_KEY?.substring(0, 7));

if (!API_KEY) {
  throw new Error("OpenAI API key is not configured in environment variables");
}

const openai = new OpenAI({
  apiKey: API_KEY,
});

// MongoDB'ye analiz sonuçlarını kaydetmek için bir şema ve model oluşturalım
interface AnalysisResult {
  originalText: string;
  analysis: string;
  timestamp: Date;
}

export const analyzeResults = async (text: string): Promise<any> => {
  try {
    const prompt = `
      Aşağıdaki tahlil sonuçlarını detaylı bir şekilde analiz et ve şu formatta yanıt ver:
      1. Normal değerlerin dışında olan sonuçlar: Sadece normal aralığın dışında olan değerleri listele
      2. Bu sonuçların ne anlama gelebileceği: Her anormal değer için olası nedenleri açıkla
      3. Genel sağlık önerileri: Sonuçlara göre özel öneriler sun
      4. Dikkat edilmesi gereken noktalar: Hangi değerlerin takip edilmesi gerektiğini belirt

      Yanıtı net ve anlaşılır bir dille, Türkçe olarak ver.
      Her bölümü ayrı paragraflar halinde formatla.

      Tahlil sonuçları:
      ${text}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    throw new Error(
      `AI analizi başarısız: ${error.message || "Bilinmeyen hata"}`
    );
  }
};
