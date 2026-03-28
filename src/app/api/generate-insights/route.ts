import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY || "";
    const groq = new Groq({ apiKey });
    const { expenses, currency = "USD" } = await req.json();
    
    if (!expenses || expenses.length === 0) {
      return NextResponse.json({ tips: ["Record some expenses to get insights!"] });
    }

    const expensesSummary = expenses.map((e: any) => `${e.date}: ${currency} ${e.amount} at ${e.vendor} (${e.category})`).join("\n");

    const prompt = `Analyze the following user expenses (all amounts in ${currency}) and provide exactly 3 concise, actionable saving tips or insights.
Format the output strictly as a JSON object with a single key "tips" containing a JSON array of strings. Use the ${currency} symbol or code in your advice where applicable. Do not include markdown formatting.

Expenses:
${expensesSummary}`;

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
          temperature: 0.2,
          response_format: { type: "json_object" },
        });
        break;
      } catch (e: any) {
        console.warn(`Model ${model} failed in insights: ${e.message}`);
        lastError = e;
      }
    }

    if (!result) {
      throw new Error(`All text models failed for insights. Last error: ${lastError?.message}`);
    }
    
    const text = result.choices[0]?.message?.content || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const parsed = JSON.parse(cleanText);
        return NextResponse.json({ tips: parsed.tips || parsed || [] });
    } catch (e) {
        console.error("Failed to parse Groq response as JSON", text);
        return NextResponse.json({ tips: ["Keep track of your spending patterns to find savings."] });
    }

  } catch (error: any) {
    console.error("Error generating insights:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
