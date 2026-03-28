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

    // 2026 Resilient Vision Model List - Optimized for GA (General Availability)
    const VISION_MODELS = [
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "llama-3.2-11b-vision-instruct",
      "llama-3.2-90b-vision-instruct"
    ];

    const prompt = `You are a professional financial AI specialized in parsing paper receipts. 
    Analyze the uploaded image and extract exactly 4 fields:
    1. "amount": The total final amount paid (number).
    2. "category": Choose the most likely category (e.g., Food, Transport, Shopping, Groceries, Utilities, Health, Other).
    3. "vendor": The name of the merchant/store.
    4. "date": The transaction date in YYYY-MM-DD format. If illegible, use "${new Date().toISOString().split('T')[0]}".
    
    Return ONLY a raw JSON object with these keys. No markdown, no extra text.`;

    let result;
    let lastError;
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

    // Retry loop for different vision models
    for (const model of VISION_MODELS) {
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
          model,
          temperature: 0,
          response_format: { type: "json_object" },
        });
        
        break; // Success! Exit the loop
      } catch (e: any) {
        console.warn(`Model ${model} failed: ${e.message}. Trying next...`);
        lastError = e;
      }
    }

    if (!result) {
      throw new Error(`All vision models failed. Last error: ${lastError?.message}`);
    }

    const text = result.choices[0]?.message?.content || "";
    
    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanText = jsonMatch ? jsonMatch[0] : text;
    
    try {
        const parsedData = JSON.parse(cleanText);
        // Ensure numbers are truly numbers
        if (parsedData.amount) parsedData.amount = parseFloat(parsedData.amount);
        return NextResponse.json(parsedData);
    } catch (e) {
      console.error("Groq JSON Parse Error. Raw Text:", text);
      return NextResponse.json({ 
        error: "AI returned invalid format", 
        raw: text 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Receipt API Error:", error.message);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error",
      details: error.response?.data || null
    }, { status: 500 });
  }
}
