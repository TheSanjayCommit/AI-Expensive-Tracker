import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    
    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are an AI assistant parsing physical expense receipts. 
Extract the total amount, category, vendor, and date from the uploaded receipt image.
If the date is missing or illegible, assume today's date: ${new Date().toISOString()}.
Return ONLY a raw valid JSON object with these exact keys: "amount" (number), "category" (string), "vendor" (string), "date" (string, ISO format YYYY-MM-DD format). Do not enclose it in markdown blocks or json ticks. Just the raw JSON.`;

    let result;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64.split(",")[1] || imageBase64,
            mimeType: mimeType || "image/jpeg"
          }
        }
      ]);
    } catch (e: any) {
      if (e.message?.includes("503") || e.message?.includes("Service Unavailable")) {
        console.warn("Primary model 503 error. Falling back to gemini-2.5-flash-8b...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-8b" });
        result = await fallbackModel.generateContent([
          prompt,
          {
            inlineData: {
              data: imageBase64.split(",")[1] || imageBase64,
              mimeType: mimeType || "image/jpeg"
            }
          }
        ]);
      } else {
        throw e;
      }
    }

    const text = result.response.text();
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const parsedData = JSON.parse(cleanText);
        return NextResponse.json(parsedData);
    } catch (e) {
        console.error("Failed to parse Gemini vision response as JSON", text);
        return NextResponse.json({ error: "Failed to parse receipt data. Text returned: " + text }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error analyzing receipt:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
