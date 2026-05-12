"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface Message {
  role: "user" | "assistant";
  content: string;
  risk?: RiskLevel;
}

const RESOURCE_CARDS: Record<RiskLevel, { title: string; desc: string; action: string; href: string; color: string }[]> = {
  LOW: [
    { title: "Self-Help Resources", desc: "Tips for managing stress, anxiety, and everyday challenges.", action: "Explore Resources", href: "https://www.beyondblue.org.au/mental-health/anxiety", color: "teal" },
    { title: "Beyond Blue", desc: "Information and support for mental health and wellbeing.", action: "1300 22 4636", href: "tel:1300224636", color: "blue" },
  ],
  MEDIUM: [
    { title: "Evolve Hub - Walk In", desc: "Free counselling, psychology & care navigation. Mon-Fri 9am-5pm.", action: "12 Smith St, Charlestown", href: "https://maps.google.com/?q=12+Smith+St+Charlestown+NSW", color: "teal" },
    { title: "Beyond Blue", desc: "Speak to a trained mental health professional now.", action: "1300 22 4636", href: "tel:1300224636", color: "blue" },
  ],
  HIGH: [
    { title: "Lifeline - Crisis Support", desc: "24/7 crisis support and suicide prevention line. You are not alone.", action: "Call 13 11 14 Now", href: "tel:131114", color: "red" },
    { title: "Emergency Services", desc: "If you or someone is in immediate danger, call triple zero.", action: "Call 000 Now", href: "tel:000", color: "red" },
    { title: "Evolve Hub", desc: "Walk-in support available Mon-Fri 9am-5pm.", action: "12 Smith St, Charlestown", href: "https://maps.google.com/?q=12+Smith+St+Charlestown+NSW", color: "teal" },
  ],
};

const RISK_BANNER: Record<RiskLevel, { bg: string; text: string; message: string } | null> = {
  LOW: null,
  MEDIUM: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800", message: "It sounds like you could use some support. The Evolve Hub offers free walk-in counselling." },
  HIGH: { bg: "bg-red-50 border-red-300", text: "text-red-800", message: "Your safety matters. Please reach out to Lifeline on 13 11 14 or call 000 if you are in danger." },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>("LOW");
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function startChat() {
    setStarted(true);
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });
    const data = await res.json();
    setMessages([{ role: "assistant", content: data.text, risk: data.risk }]);
    setCurrentRisk(data.risk);
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    const assistantMsg: Message = { role: "assistant", content: data.text, risk: data.risk };
    setMessages([...newMessages, assistantMsg]);
    setCurrentRisk(data.risk);
    setLoading(false);
  }

  const banner = RISK_BANNER[currentRisk];
  const resources = RESOURCE_CARDS[currentRisk];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Emergency Bar */}
      <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium">
        Crisis? Call{" "}
        <a href="tel:131114" className="underline font-bold">Lifeline 13 11 14</a>{" "}
        or{" "}
        <a href="tel:000" className="underline font-bold">000</a>
      </div>

      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">E</div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Evolve Support Assistant</p>
            <p className="text-xs text-green-500">● Online · Anonymous</p>
          </div>
        </Link>
      </header>

      <div className="flex flex-1 max-w-5xl mx-auto w-full gap-4 p-4">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Risk Banner */}
          {banner && (
            <div className={`rounded-xl border p-3 mb-3 ${banner.bg}`}>
              <p className={`text-sm font-medium ${banner.text}`}>{banner.message}</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
            {!started ? (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                <div className="text-5xl">💚</div>
                <h2 className="text-xl font-bold text-gray-800">Welcome to Evolve Connect</h2>
                <p className="text-gray-500 text-sm max-w-xs">
                  This is a safe, anonymous space to talk about how you&apos;re feeling.
                  Our AI assistant will listen and help connect you with the right support.
                </p>
                <p className="text-xs text-gray-400 italic">
                  Not a medical service. For emergencies, call 000.
                </p>
                <button
                  onClick={startChat}
                  className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors mt-2"
                >
                  Start Chat
                </button>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">E</div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-teal-600 text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">E</div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          {started && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type how you're feeling..."
                disabled={loading}
                className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-teal-400 bg-white text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-teal-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-teal-700 disabled:opacity-40 transition-colors"
              >
                Send
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 text-center mt-2">
            Anonymous · Conversations are not stored · Not a substitute for professional care
          </p>
        </div>

        {/* Resource Sidebar */}
        <div className="hidden md:flex flex-col w-64 gap-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Support Resources</h3>
          {resources.map((r, i) => (
            <a
              key={i}
              href={r.href}
              target={r.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`rounded-xl p-4 border transition-transform hover:scale-[1.02] ${
                r.color === "red"
                  ? "bg-red-50 border-red-200"
                  : r.color === "blue"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-teal-50 border-teal-200"
              }`}
            >
              <h4 className="font-semibold text-gray-800 text-sm mb-1">{r.title}</h4>
              <p className="text-gray-500 text-xs mb-2">{r.desc}</p>
              <span className={`text-xs font-bold ${r.color === "red" ? "text-red-600" : r.color === "blue" ? "text-blue-600" : "text-teal-600"}`}>
                {r.action} →
              </span>
            </a>
          ))}

          {/* Always-visible crisis */}
          <div className="mt-auto rounded-xl bg-red-600 p-4 text-white">
            <p className="font-bold text-sm mb-1">Crisis? Call Now</p>
            <a href="tel:131114" className="block text-lg font-bold underline">13 11 14</a>
            <p className="text-xs opacity-80">Lifeline · 24/7 · Free</p>
          </div>
        </div>
      </div>
    </div>
  );
}
