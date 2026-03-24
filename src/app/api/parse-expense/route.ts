import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const { transcript } = await req.json();
    
    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const prompt = `You are an AI assistant parsing expense information. 
Extract the amount, category, vendor, and date from the following text: "${transcript}".
Assume the current date is ${new Date().toISOString()} if "today" or "yesterday" is mentioned.
Return ONLY a raw valid JSON object with these exact keys: "amount" (number), "category" (string), "vendor" (string), "date" (string, ISO format YYYY-MM-DD format). Do not enclose it in markdown blocks or json ticks. Just the raw JSON.`;

    let result;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      result = await model.generateContent(prompt);
    } catch (e: any) {
      if (e.message?.includes("503") || e.message?.includes("Service Unavailable") || e.message?.includes("not found")) {
        console.warn("Primary model error. Falling back to gemini-1.5-flash...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        result = await fallbackModel.generateContent(prompt);
      } else {
        throw e;
      }
    }

    const text = result.response.text();
    
    // Clean up potential markdown from the LLM response
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const parsedData = JSON.parse(cleanText);
        return NextResponse.json(parsedData);
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON", text);
        return NextResponse.json({ error: "Failed to parse structured data from AI" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
