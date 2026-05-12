import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { TriageData } from "../recommend/route";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface PersonalCard {
  headline: string;
  message: string;
  theme: "teal" | "blue" | "purple" | "amber" | "rose";
  emoji: string;
}

const MOCK_CARDS: Record<string, PersonalCard> = {
  info: { headline: "Knowledge is a great first step", message: "You're doing something really positive by seeking information. Understanding your mental health is powerful, and we're here to make that easy.", theme: "blue", emoji: "📚" },
  talk: { headline: "Reaching out takes courage", message: "It's okay to not be okay. Wanting to talk is one of the bravest things you can do, and the right support can make a real difference.", theme: "teal", emoji: "💬" },
  cope: { headline: "You don't have to face this alone", message: "What you're feeling is valid. There are people who care and want to help — you've already taken the hardest step by being here.", theme: "rose", emoji: "🤝" },
};

export async function POST(req: NextRequest) {
  const data: TriageData = await req.json();

  const feelingLabel = { info: "just needs information", talk: "struggling and wants to talk", cope: "finding it really hard to cope" }[data.feeling] ?? data.feeling;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: "You are a compassionate mental health support coordinator. Generate a short personalised acknowledgment card for a user who just completed a mental health triage. Return ONLY valid JSON.",
      messages: [{
        role: "user",
        content: `Generate a personalised acknowledgment card for:
- Name: ${data.nickname || "this person"}
- Age: ${data.age}
- Gender: ${data.gender}
- How they feel: ${feelingLabel}

Return this exact JSON (no other text):
{
  "headline": "...(short warm headline, use their name, max 8 words)",
  "message": "...(2 sentences, warm and validating, tailored to their age and situation)",
  "theme": "teal|blue|purple|amber|rose",
  "emoji": "...(single emoji that fits their mood)"
}

Theme guide: blue=info/calm, teal=wanting-to-talk, purple=reflective, amber=hopeful, rose=struggling.`
      }]
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const card: PersonalCard = jsonMatch ? JSON.parse(jsonMatch[0]) : MOCK_CARDS[data.feeling] ?? MOCK_CARDS.talk;
    return NextResponse.json({ card });
  } catch {
    return NextResponse.json({ card: MOCK_CARDS[data.feeling] ?? MOCK_CARDS.talk });
  }
}
