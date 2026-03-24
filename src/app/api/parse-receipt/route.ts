import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    
    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }
    const groq = new Groq({ apiKey });

    const prompt = `You are an AI assistant parsing physical expense receipts. 
Extract the total amount, category, vendor, and date from the uploaded receipt image.
If the date is missing or illegible, assume today's date: ${new Date().toISOString()}.
Return ONLY a raw valid JSON object with these exact keys: "amount" (number), "category" (string), "vendor" (string), "date" (string, ISO format YYYY-MM-DD format). Do not enclose it in markdown blocks.`;

    let result;
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    
    try {
      result = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        model: "llama-3.2-11b-vision-preview",
        temperature: 0,
        response_format: { type: "json_object" },
      });
    } catch (e: any) {
      console.warn("Primary vision model error. Falling back to llama-3.2-90b-vision-preview...");
      result = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        model: "llama-3.2-90b-vision-preview",
        temperature: 0,
        response_format: { type: "json_object" },
      });
    }

    const text = result.choices[0]?.message?.content || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const parsedData = JSON.parse(cleanText);
        return NextResponse.json(parsedData);
    } catch (e) {
        console.error("Failed to parse Groq vision response as JSON", text);
        return NextResponse.json({ error: "Failed to parse receipt data. Text returned: " + text }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error analyzing receipt:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
