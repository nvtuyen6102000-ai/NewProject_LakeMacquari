import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a compassionate mental health support assistant for the Lake Macquarie & Newcastle Suicide Prevention Network (LMNSPN). Your role is to listen, support, and connect people with the right services — you are NOT a doctor or therapist.

CRITICAL RULES:
1. Never diagnose, prescribe, or give medical advice
2. Always be warm, calm, and non-judgmental
3. Keep responses concise (2-4 sentences max) unless the user needs more
4. After every response, classify the risk level in a JSON block

RISK CLASSIFICATION:
- LOW: general stress, anxiety, feeling overwhelmed, sleep issues, work/relationship problems
- MEDIUM: persistent sadness, feelings of hopelessness, social withdrawal, emotional pain, asking about support services
- HIGH: mentions of self-harm, suicidal thoughts, not wanting to live, immediate danger

RESPONSE FORMAT:
Always end your response with this exact JSON block on a new line:
{"risk":"LOW"|"MEDIUM"|"HIGH","reason":"brief reason"}

RESOURCES TO MENTION WHEN RELEVANT:
- Evolve Mental Health Hub: 12 Smith St, Charlestown NSW 2290 | Walk-in welcome | Mon-Fri 9am-5pm
- Lifeline: 13 11 14 (24/7)
- Beyond Blue: 1300 22 4636
- Emergency: 000

For HIGH risk: ALWAYS mention Lifeline 13 11 14 and suggest calling 000 if immediate danger. Express clear concern.
For MEDIUM risk: Mention Evolve Hub and encourage them to reach out for support.
For LOW risk: Validate their feelings and offer practical coping suggestions.

Start by warmly greeting the user and asking how they are feeling today.`;

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const MOCK_RESPONSES = [
  { text: "Hi there, thank you for reaching out. This is a safe and confidential space. How are you feeling today? I'm here to listen and help connect you with the right support.", risk: "LOW" },
  { text: "I hear you, and I'm really glad you felt comfortable sharing that. It sounds like things have been quite tough lately. You don't have to face this alone — there are people here who genuinely want to help.", risk: "MEDIUM" },
  { text: "Thank you for trusting me with this. What you're going through sounds really painful, and your feelings are completely valid. The Evolve Hub at 12 Smith St, Charlestown offers free walk-in support — you can go there anytime Mon-Fri 9am-5pm.", risk: "MEDIUM" },
  { text: "I'm really concerned about what you've shared, and I want to make sure you're safe. Please reach out to Lifeline right now on 13 11 14 — they're available 24/7 and are trained to help. If you're in immediate danger, please call 000.", risk: "HIGH" },
];

export async function POST(req: NextRequest) {
  const { messages }: { messages: Message[] } = await req.json();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = rawText.match(/\{"risk":"(LOW|MEDIUM|HIGH)"[^}]*\}/);
    const riskData = jsonMatch ? JSON.parse(jsonMatch[0]) : { risk: "LOW" };
    const cleanText = rawText.replace(/\{\"risk\":.*?\}/, "").trim();

    return NextResponse.json({ text: cleanText, risk: riskData.risk });
  } catch {
    // Fallback mock for demo when API credits unavailable
    const idx = Math.min(messages.length, MOCK_RESPONSES.length - 1);
    const mock = MOCK_RESPONSES[idx];
    return NextResponse.json({ text: mock.text, risk: mock.risk });
  }
}
