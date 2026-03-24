import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { expenses } = await req.json();
    
    if (!expenses || expenses.length === 0) {
      return NextResponse.json({ tips: ["Record some expenses to get insights!"] });
    }

    const expensesSummary = expenses.map((e: any) => `${e.date}: $${e.amount} at ${e.vendor} (${e.category})`).join("\n");

    const prompt = `Analyze the following user expenses and provide exactly 3 concise, actionable saving tips or insights.
Format the output as a valid JSON array of strings. Do not include markdown formatting or the word json. Just return the raw JSON array.

Expenses:
${expensesSummary}`;

    let result;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      result = await model.generateContent(prompt);
    } catch (e: any) {
      if (e.message?.includes("503") || e.message?.includes("Service Unavailable")) {
        console.warn("Primary model 503 error. Falling back to gemini-2.5-flash-8b...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-8b" });
        result = await fallbackModel.generateContent(prompt);
      } else {
        throw e;
      }
    }
    const text = result.response.text();
    
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const tips = JSON.parse(cleanText);
        return NextResponse.json({ tips });
    } catch (e) {
        console.error("Failed to parse Gemini tips response as JSON", text);
        return NextResponse.json({ tips: ["Keep track of your spending patterns to find savings."] });
    }

  } catch (error: any) {
    console.error("Error generating insights:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
