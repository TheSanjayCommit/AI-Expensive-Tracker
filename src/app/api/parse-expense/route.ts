import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY || "";
    const groq = new Groq({ apiKey });
    const { transcript } = await req.json();
    
    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const prompt = `You are an AI assistant parsing expense information. 
Extract the amount, category, vendor, and date from the following text: "${transcript}".
Assume the current date is ${new Date().toISOString()} if "today" or "yesterday" is mentioned.
Return ONLY a raw valid JSON object with these exact keys: "amount" (number), "category" (string), "vendor" (string), "date" (string, ISO format YYYY-MM-DD format). Do not enclose it in markdown blocks or json ticks. Just the raw JSON.`;

    const TEXT_MODELS = [
      "openai/gpt-oss-120b",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "llama-3.3-70b-versatile"
    ];

    let result;
    let lastError;

    for (const model of TEXT_MODELS) {
      try {
        result = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model,
          temperature: 0,
          response_format: { type: "json_object" },
        });
        break;
      } catch (e: any) {
        console.warn(`Model ${model} failed in transcript parsing: ${e.message}`);
        lastError = e;
      }
    }

    if (!result) {
      throw new Error(`All text models failed for transcript parsing. Last error: ${lastError?.message}`);
    }

    const text = result.choices[0]?.message?.content || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const parsedData = JSON.parse(cleanText);
        return NextResponse.json(parsedData);
    } catch (e) {
        console.error("Failed to parse Groq response as JSON", text);
        return NextResponse.json({ error: "Failed to parse structured data from AI" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
