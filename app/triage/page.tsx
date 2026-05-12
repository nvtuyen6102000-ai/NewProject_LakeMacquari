"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "safety" | "emergency" | "info" | "feeling" | "support" | "personal" | "loading" | "result";

interface BookingForm {
  name: string;
  phone: string;
  date: string;
  time: string;
}

function generateClientId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

interface UserData {
  nickname: string;
  age: string;
  gender: string;
  feeling: string;
  support: string;
}

interface Recommendation {
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  action: string;
  href: string;
  type: "resource" | "activity" | "service" | "chat" | "crisis";
  status?: string;
  address?: string;
  areas?: string[];
  phone?: string;
  wait_time?: string;
  provider_org?: string;
  provider_contact?: string;
  provider_service?: string;
}

const FEELINGS = [
  { value: "info", label: "I just need some information or resources", icon: "📚" },
  { value: "talk", label: "I'm struggling and want to talk to someone", icon: "💬" },
  { value: "cope", label: "I'm finding it really hard to cope", icon: "🤝" },
];

const SUPPORTS = [
  { value: "selfhelp", label: "Read self-help resources", icon: "📖" },
  { value: "book", label: "Book an appointment at Evolve Hub", icon: "📅" },
  { value: "chat", label: "Chat with someone online", icon: "💬" },
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const CATEGORY_STYLE: Record<string, { card: string; badge: string; btn: string }> = {
  "Crisis Support":   { card: "bg-red-50   border-red-200",    badge: "bg-red-100 text-red-600",      btn: "bg-red-600 hover:bg-red-700" },
  "Psychology":       { card: "bg-teal-50  border-teal-200",   badge: "bg-teal-100 text-teal-700",    btn: "bg-teal-600 hover:bg-teal-700" },
  "Counselling":      { card: "bg-blue-50  border-blue-200",   badge: "bg-blue-100 text-blue-700",    btn: "bg-blue-600 hover:bg-blue-700" },
  "Mental Health":    { card: "bg-cyan-50  border-cyan-200",   badge: "bg-cyan-100 text-cyan-700",    btn: "bg-cyan-600 hover:bg-cyan-700" },
  "Digital Support":  { card: "bg-indigo-50 border-indigo-200",badge: "bg-indigo-100 text-indigo-700",btn: "bg-indigo-500 hover:bg-indigo-600" },
  "Online Resource":  { card: "bg-purple-50 border-purple-200",badge: "bg-purple-100 text-purple-700",btn: "bg-purple-500 hover:bg-purple-600" },
  "Education":        { card: "bg-amber-50 border-amber-200",  badge: "bg-amber-100 text-amber-700",  btn: "bg-amber-500 hover:bg-amber-600" },
  "Youth Programs":   { card: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700", btn: "bg-emerald-500 hover:bg-emerald-600" },
  "default":          { card: "bg-gray-50  border-gray-200",   badge: "bg-gray-100 text-gray-600",    btn: "bg-teal-500 hover:bg-teal-600" },
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLE[category] ?? CATEGORY_STYLE["default"];
}

const STATUS_STYLE: Record<string, string> = {
  "Open":        "bg-teal-400 text-white",
  "Online":      "bg-blue-400 text-white",
  "By Referral": "bg-amber-400 text-white",
};

export default function TriagePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("safety");
  const [data, setData] = useState<UserData>({ nickname: "", age: "", gender: "", feeling: "", support: "" });
  const [errors, setErrors] = useState<Partial<UserData>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [clientId, setClientId] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState<BookingForm>({ name: "", phone: "", date: "", time: "" });
  const [bookingDone, setBookingDone] = useState(false);
  const [personalCard, setPersonalCard] = useState<{ headline: string; message: string; theme: string; emoji: string } | null>(null);
  const [pendingRecs, setPendingRecs] = useState<import("../api/recommend/route").Recommendation[] | null>(null);

  const stepNumber = { safety: 1, info: 2, feeling: 3, support: 4, personal: 4, loading: 4, result: 5 };
  const totalSteps = 4;
  const currentNum = stepNumber[step as keyof typeof stepNumber] ?? 1;

  function handleSafety(answer: string) {
    if (answer === "yes") {
      setStep("info");
    } else {
      setStep("emergency");
    }
  }

  function handleInfoNext() {
    const errs: Partial<UserData> = {};
    if (!data.nickname.trim()) errs.nickname = "Required";
    if (!data.age || isNaN(Number(data.age)) || Number(data.age) < 10 || Number(data.age) > 100) errs.age = "Enter a valid age";
    if (!data.gender) errs.gender = "Required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep("feeling");
  }

  function handleFeeling(value: string) {
    setData({ ...data, feeling: value });
    if (value === "cope") {
      setStep("emergency");
    } else {
      setStep("support");
    }
  }

  async function handleSupport(value: string) {
    const updated = { ...data, support: value };
    setData(updated);
    setStep("personal");

    // Fire both requests in parallel
    const [cardRes, recRes] = await Promise.allSettled([
      fetch("/api/personal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) }),
      fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) }),
    ]);

    if (cardRes.status === "fulfilled") {
      const json = await cardRes.value.json();
      setPersonalCard(json.card);
    }
    if (recRes.status === "fulfilled") {
      const json = await recRes.value.json();
      setPendingRecs(json.recommendations);
    } else {
      setPendingRecs([]);
    }

    const id = generateClientId();
    setClientId(id);
    setBooking((b) => ({ ...b, name: updated.nickname }));
  }

  function handleSeeRecommendations() {
    if (pendingRecs !== null) {
      setRecommendations(pendingRecs);
      setStep("result");
    } else {
      setStep("loading");
    }
  }

  function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const record = { clientId, ...booking, submittedAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("evolve_bookings") ?? "[]");
    localStorage.setItem("evolve_bookings", JSON.stringify([...existing, record]));
    setBookingDone(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white text-lg">📋</div>
          <div>
            <h1 className="font-bold text-gray-800 text-base leading-tight">Mental Health Check Point</h1>
            <p className="text-gray-500 text-xs">The Lake Macquarie & Newcastle Suicide Prevention Network</p>
          </div>
        </div>
      </header>

      <main className={`mx-auto px-4 py-10 transition-all duration-300 ${step === "result" ? "max-w-4xl" : "max-w-xl"}`}>
        {/* Emergency Screen */}
        {step === "emergency" && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🆘</div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">You are not alone</h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              It sounds like you need support right now. Please reach out immediately — trained professionals are available 24/7.
            </p>
            <div className="space-y-3 mb-6">
              <a href="tel:131114" className="flex items-center justify-between bg-red-600 text-white rounded-xl px-5 py-4 hover:bg-red-700 transition-colors">
                <div className="text-left">
                  <p className="font-bold text-lg">Lifeline</p>
                  <p className="text-red-200 text-xs">24/7 Crisis Support</p>
                </div>
                <p className="text-2xl font-bold">13 11 14</p>
              </a>
              <a href="tel:000" className="flex items-center justify-between bg-gray-800 text-white rounded-xl px-5 py-4 hover:bg-gray-900 transition-colors">
                <div className="text-left">
                  <p className="font-bold text-lg">Emergency Services</p>
                  <p className="text-gray-400 text-xs">Immediate danger</p>
                </div>
                <p className="text-2xl font-bold">000</p>
              </a>
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-4 text-left">
                <p className="font-semibold text-teal-800 text-sm">Evolve Mental Health Hub</p>
                <p className="text-teal-600 text-xs">12 Smith St, Charlestown · Walk-in · Mon-Fri 9am-5pm</p>
              </div>
            </div>
            <button
              onClick={() => setStep("safety")}
              className="text-teal-600 text-sm underline hover:text-teal-700"
            >
              Go back to start
            </button>
          </div>
        )}

        {/* Loading Screen */}
        {step === "loading" && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Personalising your recommendations...</h2>
            <p className="text-gray-500 text-sm">Our AI is creating tailored support options just for you.</p>
          </div>
        )}

        {/* Personal Card Screen */}
        {step === "personal" && (() => {
          const THEME: Record<string, { bg: string; border: string; btn: string; badge: string }> = {
            teal:   { bg: "bg-teal-50",   border: "border-teal-200",   btn: "bg-teal-500 hover:bg-teal-600",   badge: "bg-teal-100 text-teal-700" },
            blue:   { bg: "bg-blue-50",   border: "border-blue-200",   btn: "bg-blue-500 hover:bg-blue-600",   badge: "bg-blue-100 text-blue-700" },
            purple: { bg: "bg-purple-50", border: "border-purple-200", btn: "bg-purple-500 hover:bg-purple-600", badge: "bg-purple-100 text-purple-700" },
            amber:  { bg: "bg-amber-50",  border: "border-amber-200",  btn: "bg-amber-500 hover:bg-amber-600",  badge: "bg-amber-100 text-amber-700" },
            rose:   { bg: "bg-rose-50",   border: "border-rose-200",   btn: "bg-rose-500 hover:bg-rose-600",   badge: "bg-rose-100 text-rose-700" },
          };
          const theme = THEME[personalCard?.theme ?? "teal"] ?? THEME.teal;
          return (
            <div className={`rounded-2xl shadow-md p-8 border-2 ${theme.bg} ${theme.border} text-center`}>
              {personalCard ? (
                <>
                  <div className="text-6xl mb-4">{personalCard.emoji}</div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">{personalCard.headline}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">{personalCard.message}</p>
                  <button
                    onClick={handleSeeRecommendations}
                    disabled={pendingRecs === null}
                    className={`w-full text-white font-semibold py-4 rounded-xl transition-colors ${theme.btn} disabled:opacity-50 disabled:cursor-wait`}
                  >
                    {pendingRecs === null ? "Preparing your recommendations..." : "See my recommendations →"}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-gray-500 text-sm">Personalising your experience...</p>
                </>
              )}
            </div>
          );
        })()}

        {/* Normal Steps */}
        {step !== "emergency" && step !== "loading" && step !== "personal" && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            {/* Progress */}
            {step !== "result" && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Step {currentNum} of {totalSteps}</span>
                  <span>{Math.round((currentNum / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentNum / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Step 1 - Safety */}
            {step === "safety" && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-4xl mb-3">🙏</div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Are you safe right now?</h2>
                  <p className="text-gray-500 text-sm">Please answer honestly — your safety comes first.</p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => handleSafety("yes")}
                    className="w-full text-left border-2 border-gray-200 rounded-xl px-5 py-4 hover:border-teal-400 hover:bg-teal-50 transition-all group"
                  >
                    <span className="text-gray-800 font-medium group-hover:text-teal-700">✅ Yes, I&apos;m okay</span>
                  </button>
                  <button
                    onClick={() => handleSafety("unsure")}
                    className="w-full text-left border-2 border-gray-200 rounded-xl px-5 py-4 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                  >
                    <span className="text-gray-800 font-medium group-hover:text-amber-700">🤔 I&apos;m not sure</span>
                  </button>
                  <button
                    onClick={() => handleSafety("no")}
                    className="w-full text-left border-2 border-gray-200 rounded-xl px-5 py-4 hover:border-red-400 hover:bg-red-50 transition-all group"
                  >
                    <span className="text-gray-800 font-medium group-hover:text-red-700">🆘 No, I need help now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 - Basic Info */}
            {step === "info" && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-4xl mb-3">👋</div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Tell us a little about yourself</h2>
                  <p className="text-gray-500 text-sm">This helps us personalise your support.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nickname <span className="text-gray-400 font-normal">(what should we call you?)</span></label>
                    <input
                      type="text"
                      value={data.nickname}
                      onChange={(e) => setData({ ...data, nickname: e.target.value })}
                      placeholder="e.g. Alex"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 ${errors.nickname ? "border-red-400" : "border-gray-200"}`}
                    />
                    {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={data.age}
                      onChange={(e) => setData({ ...data, age: e.target.value })}
                      placeholder="e.g. 25"
                      min={10}
                      max={100}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 ${errors.age ? "border-red-400" : "border-gray-200"}`}
                    />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={data.gender}
                      onChange={(e) => setData({ ...data, gender: e.target.value })}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 bg-white ${errors.gender ? "border-red-400" : "border-gray-200"}`}
                    >
                      <option value="">Select...</option>
                      {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                </div>
                <button
                  onClick={handleInfoNext}
                  className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 rounded-xl transition-colors"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 3 - Feeling */}
            {step === "feeling" && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-4xl mb-3">💭</div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">How are you feeling right now{data.nickname ? `, ${data.nickname}` : ""}?</h2>
                  <p className="text-gray-500 text-sm">Select the option that best describes where you are today.</p>
                </div>
                <div className="space-y-3">
                  {FEELINGS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => handleFeeling(f.value)}
                      className="w-full text-left border-2 border-gray-200 rounded-xl px-5 py-4 hover:border-teal-400 hover:bg-teal-50 transition-all group flex items-center gap-3"
                    >
                      <span className="text-2xl">{f.icon}</span>
                      <span className="text-gray-800 font-medium text-sm group-hover:text-teal-700">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 - Support */}
            {step === "support" && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-4xl mb-3">🤲</div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">What kind of support would help most?</h2>
                  <p className="text-gray-500 text-sm">We&apos;ll connect you with the right resource.</p>
                </div>
                <div className="space-y-3">
                  {SUPPORTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleSupport(s.value)}
                      className="w-full text-left border-2 border-gray-200 rounded-xl px-5 py-4 hover:border-teal-400 hover:bg-teal-50 transition-all group flex items-center gap-3"
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-gray-800 font-medium text-sm group-hover:text-teal-700">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {step === "result" && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">💚</div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">
                    Your personalised recommendations{data.nickname ? `, ${data.nickname}` : ""}
                  </h2>
                  <p className="text-gray-500 text-sm">Based on your answers, here are 3 options tailored for you.</p>
                  {clientId && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-gray-400 text-xs">Your ID:</span>
                      <span className="font-mono font-bold text-gray-700 text-sm tracking-widest">{clientId}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mb-5 items-stretch">
                  {recommendations.map((r, i) => {
                    const s = getCategoryStyle(r.category);
                    return (
                      <div key={i} className={`rounded-2xl border-2 p-5 flex-1 flex flex-col ${s.card}`}>
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>{r.category}</span>
                          {r.status && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status] ?? "bg-gray-200 text-gray-600"}`}>{r.status}</span>
                          )}
                        </div>

                        {/* Title + subtitle */}
                        <p className="font-bold text-gray-900 text-base leading-tight">{r.title}</p>
                        {r.subtitle && <p className={`text-xs font-medium mt-0.5 mb-2 ${s.badge.split(" ")[1]}`}>{r.subtitle}</p>}
                        {r.provider_contact && <p className="text-gray-500 text-xs mb-2">{r.provider_contact}</p>}

                        {/* Description */}
                        <p className="text-gray-600 text-xs leading-relaxed mb-3 flex-1">{r.description}</p>

                        {/* Meta info */}
                        <div className="space-y-1.5 mb-3">
                          {r.address && (
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <span>📍</span> {r.address}
                            </p>
                          )}
                          {r.areas && r.areas.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {r.areas.map((a) => (
                                <span key={a} className="bg-white/60 border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-md">{a}</span>
                              ))}
                            </div>
                          )}
                          {r.phone && (
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <span>📞</span> {r.phone}
                            </p>
                          )}
                          {r.wait_time && (
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <span>⏱</span> Wait: {r.wait_time}
                            </p>
                          )}
                        </div>

                        {/* CTA */}
                        <a
                          href={r.href}
                          target={r.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          onClick={r.href === "/chat" ? (e) => { e.preventDefault(); router.push("/chat"); } : undefined}
                          className={`inline-block text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${s.btn}`}
                        >
                          {r.action} →
                        </a>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-600 flex gap-2 items-start">
                  <span>⚠️</span>
                  <span>If your situation changes and you need urgent help, call Lifeline <a href="tel:131114" className="font-bold underline">13 11 14</a> or <a href="tel:000" className="font-bold underline">000</a>.</span>
                </div>

                {!showBooking ? (
                  <button
                    onClick={() => setShowBooking(true)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors mb-3"
                  >
                    Make an Appointment
                  </button>
                ) : bookingDone ? (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-3 text-center">
                    <p className="text-teal-700 font-semibold text-sm mb-1">Appointment requested!</p>
                    <p className="text-teal-600 text-xs">Reference ID: <span className="font-mono font-bold">{clientId}</span></p>
                    <p className="text-gray-400 text-xs mt-1">The Hub team will confirm your booking.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 space-y-3">
                    <p className="font-semibold text-gray-800 text-sm mb-2">Book at Evolve Hub</p>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Full name</label>
                      <input
                        required
                        type="text"
                        value={booking.name}
                        onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Phone number</label>
                      <input
                        required
                        type="tel"
                        value={booking.phone}
                        onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                        placeholder="04XX XXX XXX"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input
                          required
                          type="date"
                          value={booking.date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Time</label>
                        <select
                          required
                          value={booking.time}
                          onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white"
                        >
                          <option value="">Select...</option>
                          {["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBooking(false)}
                        className="flex-1 border border-gray-200 text-gray-500 text-sm py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                )}

                <button
                  onClick={() => setStep("safety")}
                  className="w-full text-gray-400 text-xs underline hover:text-gray-600 py-2"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Anonymous · Not a substitute for professional care · LMNSPN 2026
        </p>
      </main>
    </div>
  );
}
