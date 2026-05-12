import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TriageData {
  nickname: string;
  age: string;
  gender: string;
  feeling: string;
  support: string;
}

export interface Recommendation {
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  action: string;
  href: string;
  type: "resource" | "activity" | "service" | "chat" | "crisis";
  status?: "Open" | "By Referral" | "Online";
  address?: string;
  areas?: string[];
  phone?: string;
  wait_time?: string;
  provider_org?: string;
  provider_contact?: string;
  provider_service?: string;
}

const HUB_PROVIDERS = `Evolve Mental Health & Wellbeing Hub — 12 Smith St, Charlestown NSW (walk-in, Mon-Fri 9am-5pm, free, no referral needed):
- Kara Thomson Psychology (Kara Thomson) — Psychology
- Kintsugi OT Neurodiverse Specialist (Nicholas Voican) — Occupational Therapy
- Name.Narrate.Navigate (Daniel Ebbin) — Therapy & Service Navigation
- Walk Within Transpersonal Art Therapy (Chelsea Arnold) — Art Therapy
- Constructive Thinking Counselling Services (Candice Sherriff) — Counselling
- Well Education (Laura Collison) — Education & Wellbeing
- SandWaves Therapy (Michael Bourke) — Therapy
- Top Blokes Foundation (Amy Harvison) — Men's Support (best for male-identifying users)
- Fearless Therapies (Simon Shields) — Therapy
- Gamble Aware — Financial & Gambling Counselling
- Phoenix Assist — NDIS Support Coordination
- The Rosewood Centre — Clinical Psychology
- Bright Feathers Counselling & Educational Consulting (Mel Sebastian) — Counselling`;

const MOCK_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  info: [
    {
      title: "Well Education",
      subtitle: "Education & Wellbeing Support",
      category: "Education",
      description: "Laura Collison provides wellbeing education and practical strategies to help you understand and manage your mental health.",
      action: "Visit Evolve Hub",
      href: "https://maps.google.com/?q=12+Smith+St+Charlestown+NSW",
      type: "service",
      status: "Open",
      address: "12 Smith St, Charlestown",
      areas: ["Newcastle", "Lake Macquarie"],
      wait_time: "Walk-in, no referral",
      provider_org: "Well Education",
      provider_contact: "Laura Collison",
      provider_service: "Education & Wellbeing",
    },
    {
      title: "Name.Narrate.Navigate",
      subtitle: "Therapy & Service Navigation",
      category: "Mental Health",
      description: "Daniel Ebbin helps you make sense of your options and navigate the right services for your situation.",
      action: "Visit Evolve Hub",
      href: "https://maps.google.com/?q=12+Smith+St+Charlestown+NSW",
      type: "service",
      status: "Open",
      address: "12 Smith St, Charlestown",
      areas: ["Newcastle", "Lake Macquarie"],
      wait_time: "Walk-in, no referral",
      provider_org: "Name.Narrate.Navigate",
      provider_contact: "Daniel Ebbin",
      provider_service: "Therapy & Service Navigation",
    },
    {
      title: "Beyond Blue",
      subtitle: "Mental Health Information",
      category: "Online Resource",
      description: "Trusted information on anxiety, depression and wellbeing with self-help tools available 24/7.",
      action: "Visit Website",
      href: "https://www.beyondblue.org.au",
      type: "resource",
      status: "Online",
      areas: ["Newcastle", "Lake Macquarie", "Maitland/Cessnock"],
      phone: "1300 22 4636",
      wait_time: "Immediate",
    },
  ],
  talk: [
    {
      title: "Constructive Thinking Counselling",
      subtitle: "Individual Counselling",
      category: "Counselling",
      description: "Candice Sherriff provides free, confidential counselling in a safe and non-judgmental space at Evolve Hub.",
      action: "Book at Evolve Hub",
      href: "https://maps.google.com/?q=12+Smith+St+Charlestown+NSW",
      type: "service",
      status: "Open",
      address: "12 Smith St, Charlestown",
      areas: ["Newcastle", "Lake Macquarie"],
      wait_time: "Walk-in, Mon-Fri 9am-5pm",
      provider_org: "Constructive Thinking Counselling Services",
      provider_contact: "Candice Sherriff",
      provider_service: "Counselling",
    },
    {
      title: "Evolve Connect AI Chat",
      subtitle: "24/7 Digital Support",
      category: "Digital Support",
      description: "Talk through how you're feeling with our compassionate AI assistant any time of day or night.",
      action: "Start Chat",
      href: "/chat",
      type: "chat",
      status: "Online",
      areas: ["Newcastle", "Lake Macquarie", "Maitland/Cessnock"],
      wait_time: "Immediate",
    },
    {
      title: "Beyond Blue",
      subtitle: "24/7 Telephone Support",
      category: "Crisis Support",
      description: "Speak with a trained mental health professional who can listen and help you find the right next step.",
      action: "Call Now",
      href: "tel:1300224636",
      type: "crisis",
      status: "Open",
      areas: ["Newcastle", "Lake Macquarie", "Maitland/Cessnock"],
      phone: "1300 22 4636",
      wait_time: "Immediate",
    },
  ],
  cope: [
    {
      title: "Lifeline",
      subtitle: "24/7 Crisis Support",
      category: "Crisis Support",
      description: "You don't have to face this alone. Lifeline counsellors are available around the clock for anyone in crisis.",
      action: "Call 13 11 14",
      href: "tel:131114",
      type: "crisis",
      status: "Open",
      areas: ["Newcastle", "Lake Macquarie", "Maitland/Cessnock"],
      phone: "13 11 14",
      wait_time: "Immediate",
    },
    {
      title: "The Rosewood Centre",
      subtitle: "Clinical Psychology",
      category: "Psychology",
      description: "Clinical psychology support at Evolve Hub. Walk in for free, same-day mental health care, no referral needed.",
      action: "Visit Evolve Hub",
      href: "https://maps.google.com/?q=12+Smith+St+Charlestown+NSW",
      type: "service",
      status: "Open",
      address: "12 Smith St, Charlestown",
      areas: ["Newcastle", "Lake Macquarie"],
      wait_time: "Walk-in, Mon-Fri 9am-5pm",
      provider_org: "The Rosewood Centre",
      provider_service: "Clinical Psychology",
    },
    {
      title: "Beyond Blue Online Chat",
      subtitle: "Crisis Chat Support",
      category: "Crisis Support",
      description: "If calling feels too hard, chat online with a trained counsellor at beyondblue.org.au — available 24/7.",
      action: "Chat Online",
      href: "https://www.beyondblue.org.au/get-support/get-immediate-support",
      type: "chat",
      status: "Online",
      areas: ["Newcastle", "Lake Macquarie", "Maitland/Cessnock"],
      wait_time: "Immediate",
    },
  ],
};

function getMockRecommendations(data: TriageData): Recommendation[] {
  return MOCK_RECOMMENDATIONS[data.feeling] ?? MOCK_RECOMMENDATIONS.talk;
}

export async function POST(req: NextRequest) {
  const data: TriageData = await req.json();

  const feelingLabel = { info: "just needs information", talk: "struggling and wants to talk", cope: "finding it really hard to cope" }[data.feeling] ?? data.feeling;
  const supportLabel = { selfhelp: "self-help resources", book: "booking an appointment", chat: "chatting online" }[data.support] ?? data.support;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are a mental health support coordinator for the Lake Macquarie & Newcastle Suicide Prevention Network (LMNSPN). Generate exactly 3 personalised support recommendations. At least one recommendation must be a specific provider from Evolve Hub matched to the user's needs. Return ONLY valid JSON, no other text.`,
      messages: [{
        role: "user",
        content: `Generate 3 personalised recommendations for:
- Name: ${data.nickname || "Anonymous"}
- Age: ${data.age}
- Gender: ${data.gender}
- How they feel: ${feelingLabel}
- Support wanted: ${supportLabel}

${HUB_PROVIDERS}

Return this exact JSON format:
[
  {
    "title": "...",
    "description": "...(1-2 sentences personalised to them)",
    "action": "...(button label)",
    "href": "...(URL, /chat, or tel:XXXXXX)",
    "type": "resource|activity|service|chat|crisis",
    "provider_org": "...(exact org name from list above, only if type=service at Evolve Hub, else omit)",
    "provider_contact": "...(contact person name, only if known, else omit)",
    "provider_service": "...(service type from list, only if type=service, else omit)"
  },
  {...},
  {...}
]

Matching rules:
- If gender is Male: include Top Blokes Foundation (Amy Harvison) as one option
- If feeling=info: prefer Well Education or Name.Narrate.Navigate
- If feeling=talk and support=book: prefer psychology or counselling providers (Kara Thomson, Constructive Thinking, Bright Feathers)
- If feeling=talk and support=chat: start with /chat, then suggest a Hub provider
- If feeling=cope: prioritise The Rosewood Centre (clinical psychology) or Fearless Therapies
- Always use href "https://maps.google.com/?q=12+Smith+St+Charlestown+NSW" for any Evolve Hub service
- Non-Hub recommendations: use Beyond Blue, Lifeline, or /chat as appropriate
- Tailor descriptions to their age and gender. Be warm, direct, non-clinical.`
      }]
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const recommendations: Recommendation[] = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockRecommendations(data);
    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("[recommend] AI error:", err);
    return NextResponse.json({ recommendations: getMockRecommendations(data) });
  }
}
