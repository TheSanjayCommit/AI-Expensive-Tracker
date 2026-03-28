import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.1-8b-instant"; // Using a highly reliable, instant model for fast feedback

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY is missing from environment variables");
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const systemPrompt = `
      You are a high-end AI Financial Assistant for the "AI Expense Tracker" premium dashboard.
      Your goal is to help the user manage their wealth, understand their spending patterns, and save money.
      
      User Context:
      - Name: ${context?.name || "User"}
      - Current Currency: ${context?.currency || "$"}
      - Total All-Time Spending: ${context?.currency || "$"}${context?.totalExpenses || 0}
      - This Week's Spending: ${context?.currency || "$"}${context?.totalWeekly || 0}
      - This Month's Spending: ${context?.currency || "$"}${context?.totalMonthly || 0}
      - Recent Transactions: ${(context?.recentTransactions || []).join(", ") || "None recorded yet"}

      Guidelines:
      1. Be professional, concise, and insightful.
      2. If asked about weekly/monthly spendings, use the numbers provided in the context.
      3. For "how to save money", give specific advice based on their top categories or common trends.
      4. Always maintain a premium, encouraging tone.
      5. Keep responses relatively short (under 100 words) unless a deep analysis is requested.
      6. Use the currency symbol ${context?.currency || "$"} in your responses.
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);
        throw new Error(errorData.error?.message || "Failed to fetch from Groq");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error.message || error);
    return NextResponse.json({ error: "Failed to process chat: " + (error.message || "Unknown error") }, { status: 500 });
  }
}
