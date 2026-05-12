"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "safety" | "emergency" | "who" | "about" | "mood" | "stressors" | "background" | "personal" | "result";

interface MoodScores { m1: number; m2: number; m3: number; m4: number; m5: number; }

interface UserData {
  nickname: string;
  forSelf: string;
  ageGroup: string;
  gender: string;
  mood: MoodScores;
  stressors: string[];
  prevSupport: string;
  isNDIS: string;
  safetyA: string;
  safetyB: string;
}

interface BookingForm { name: string; phone: string; date: string; time: string; }

interface Recommendation {
  title: string; subtitle?: string; description: string; category: string;
  action: string; href: string;
  type: "resource" | "activity" | "service" | "chat" | "crisis";
  status?: string; address?: string; areas?: string[]; phone?: string; wait_time?: string;
  provider_org?: string; provider_contact?: string; provider_service?: string;
}

function generateClientId() { return Math.random().toString(36).substring(2, 6).toUpperCase(); }

const AGE_GROUPS = [
  { value: "child", label: "Under 12" },
  { value: "teen", label: "12–17" },
  { value: "young_adult", label: "18–24" },
  { value: "adult", label: "25–64" },
  { value: "older", label: "65+" },
];

const GENDERS = [
  { value: "male", label: "Man" },
  { value: "female", label: "Woman" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "undisclosed", label: "Prefer not to say" },
];

const STRESSOR_OPTIONS = [
  { value: "grief", label: "Grief or loss" },
  { value: "relationship", label: "Relationship breakdown" },
  { value: "financial", label: "Financial stress" },
  { value: "gambling", label: "Gambling harm" },
  { value: "aod", label: "Alcohol or drugs" },
  { value: "trauma", label: "Past trauma or abuse" },
  { value: "neurodiversity", label: "Neurodiversity support" },
  { value: "job_housing", label: "Job or housing change" },
];

const MOOD_ROWS = [
  { key: "m1", label: "Overwhelmed or stressed" },
  { key: "m2", label: "Sad or depressed" },
  { key: "m3", label: "Anxious or worried" },
  { key: "m4", label: "Irritable or angry" },
  { key: "m5", label: "Lonely or isolated" },
];

const FREQ_COLS = ["Never", "Sometimes", "Often", "Always"];

const CATEGORY_STYLE: Record<string, { card: string; badge: string; btn: string }> = {
  "Crisis Support":  { card: "bg-red-50 border-red-200",      badge: "bg-red-100 text-red-600",       btn: "bg-red-600 hover:bg-red-700" },
  "Psychology":      { card: "bg-teal-50 border-teal-200",    badge: "bg-teal-100 text-teal-700",     btn: "bg-teal-600 hover:bg-teal-700" },
  "Counselling":     { card: "bg-blue-50 border-blue-200",    badge: "bg-blue-100 text-blue-700",     btn: "bg-blue-600 hover:bg-blue-700" },
  "Mental Health":   { card: "bg-cyan-50 border-cyan-200",    badge: "bg-cyan-100 text-cyan-700",     btn: "bg-cyan-600 hover:bg-cyan-700" },
  "Digital Support": { card: "bg-indigo-50 border-indigo-200",badge: "bg-indigo-100 text-indigo-700", btn: "bg-indigo-500 hover:bg-indigo-600" },
  "Online Resource": { card: "bg-purple-50 border-purple-200",badge: "bg-purple-100 text-purple-700", btn: "bg-purple-500 hover:bg-purple-600" },
  "Education":       { card: "bg-amber-50 border-amber-200",  badge: "bg-amber-100 text-amber-700",   btn: "bg-amber-500 hover:bg-amber-600" },
  "Youth Programs":  { card: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700", btn: "bg-emerald-500 hover:bg-emerald-600" },
  "default":         { card: "bg-gray-50 border-gray-200",    badge: "bg-gray-100 text-gray-600",     btn: "bg-teal-500 hover:bg-teal-600" },
};
function getCategoryStyle(cat: string) { return CATEGORY_STYLE[cat] ?? CATEGORY_STYLE["default"]; }
const STATUS_STYLE: Record<string, string> = {
  "Open": "bg-teal-400 text-white", "Online": "bg-blue-400 text-white", "By Referral": "bg-amber-400 text-white",
};

const TOTAL_STEPS = 6;
const STEP_NUM: Record<string, number> = { safety: 1, who: 2, about: 3, mood: 4, stressors: 5, background: 6 };

export default function TriagePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("safety");
  const [data, setData] = useState<UserData>({
    nickname: "", forSelf: "", ageGroup: "", gender: "",
    mood: { m1: -1, m2: -1, m3: -1, m4: -1, m5: -1 },
    stressors: [], prevSupport: "", isNDIS: "", safetyA: "", safetyB: "",
  });
  const [clientId, setClientId] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState<BookingForm>({ name: "", phone: "", date: "", time: "" });
  const [bookingDone, setBookingDone] = useState(false);
  const [personalCard, setPersonalCard] = useState<{ headline: string; message: string; theme: string; emoji: string } | null>(null);
  const [pendingRecs, setPendingRecs] = useState<Recommendation[] | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const currentNum = STEP_NUM[step] ?? 1;
  const progress = Math.round((currentNum / TOTAL_STEPS) * 100);

  function toggleStressor(val: string) {
    if (val === "none") { setData({ ...data, stressors: [] }); return; }
    const cur = data.stressors;
    setData({ ...data, stressors: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] });
  }

  function setMood(key: keyof MoodScores, val: number) {
    setData({ ...data, mood: { ...data.mood, [key]: val } });
  }

  async function handleBackground(prevSupport: string, isNDIS: string) {
    const updated = { ...data, prevSupport, isNDIS };
    setData(updated);
    setStep("personal");

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
    setBooking(b => ({ ...b, name: updated.nickname }));

    // Save triage snapshot for staff view
    const snapshot = { clientId: id, triageData: updated, createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("evolve_clients") ?? "[]");
    localStorage.setItem("evolve_clients", JSON.stringify([...existing, snapshot]));
  }

  function handleSeeRecommendations() {
    const recs = pendingRecs ?? [];
    setRecommendations(recs);
    // Update client snapshot with recommendations
    const clients = JSON.parse(localStorage.getItem("evolve_clients") ?? "[]");
    const updated = clients.map((c: { clientId: string }) =>
      c.clientId === clientId ? { ...c, recommendations: recs } : c
    );
    localStorage.setItem("evolve_clients", JSON.stringify(updated));
    setStep("result");
  }

  function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const record = { clientId, ...booking, submittedAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("evolve_bookings") ?? "[]");
    localStorage.setItem("evolve_bookings", JSON.stringify([...existing, record]));
    setBookingDone(true);
  }

  function resetAll() {
    setStep("safety");
    setData({ nickname: "", forSelf: "", ageGroup: "", gender: "", mood: { m1: -1, m2: -1, m3: -1, m4: -1, m5: -1 }, stressors: [], prevSupport: "", isNDIS: "", safetyA: "", safetyB: "" });
    setPersonalCard(null); setPendingRecs(null); setRecommendations([]);
    setClientId(""); setShowBooking(false); setBookingDone(false);
  }

  const chipBase = "px-4 py-2.5 rounded-full border-2 text-sm font-medium cursor-pointer transition-all select-none";
  const chipIdle = "border-gray-200 bg-gray-50 text-gray-700 hover:border-teal-400 hover:text-teal-700";
  const chipSel = "border-teal-500 bg-teal-500 text-white";
  const chipDanger = "border-red-500 bg-red-500 text-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      <header className="bg-teal-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🧭</div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Evolve Navigator</h1>
            <p className="text-teal-200 text-xs">Lake Macquarie & Newcastle Suicide Prevention Network</p>
          </div>
        </div>
      </header>

      <main className={`mx-auto px-4 py-8 transition-all duration-300 ${step === "result" ? "max-w-4xl" : "max-w-xl"}`}>

        {/* ── EMERGENCY ── */}
        {step === "emergency" && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-5xl mb-4">🆘</div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">Please reach out right now</h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">It sounds like things are really difficult. Your safety matters. These services are available 24/7.</p>
            <div className="space-y-3 mb-6">
              <a href="tel:131114" className="flex items-center justify-between bg-red-600 text-white rounded-xl px-5 py-4 hover:bg-red-700 transition-colors">
                <div className="text-left"><p className="font-bold">Lifeline</p><p className="text-red-200 text-xs">24/7 Crisis Support</p></div>
                <p className="text-xl font-bold">13 11 14</p>
              </a>
              <a href="tel:1300659467" className="flex items-center justify-between bg-red-700 text-white rounded-xl px-5 py-4 hover:bg-red-800 transition-colors">
                <div className="text-left"><p className="font-bold">Suicide Call Back Service</p><p className="text-red-200 text-xs">24/7</p></div>
                <p className="text-sm font-bold">1300 659 467</p>
              </a>
              <a href="tel:000" className="flex items-center justify-between bg-gray-800 text-white rounded-xl px-5 py-4 hover:bg-gray-900 transition-colors">
                <div className="text-left"><p className="font-bold">Emergency Services</p><p className="text-gray-400 text-xs">Immediate danger</p></div>
                <p className="text-xl font-bold">000</p>
              </a>
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-4 text-left">
                <p className="font-semibold text-teal-800 text-sm">Evolve Mental Health Hub</p>
                <p className="text-teal-600 text-xs">12 Smith St, Charlestown · Walk-in · Mon-Fri 9am-5pm</p>
              </div>
            </div>
            <button onClick={resetAll} className="text-teal-600 text-sm underline hover:text-teal-700">Go back to start</button>
          </div>
        )}

        {/* ── PERSONAL CARD ── */}
        {step === "personal" && (() => {
          const THEME: Record<string, { bg: string; border: string; btn: string }> = {
            teal:   { bg: "bg-teal-50",   border: "border-teal-300",   btn: "bg-teal-600 hover:bg-teal-700" },
            blue:   { bg: "bg-blue-50",   border: "border-blue-300",   btn: "bg-blue-600 hover:bg-blue-700" },
            purple: { bg: "bg-purple-50", border: "border-purple-300", btn: "bg-purple-600 hover:bg-purple-700" },
            amber:  { bg: "bg-amber-50",  border: "border-amber-300",  btn: "bg-amber-500 hover:bg-amber-600" },
            rose:   { bg: "bg-rose-50",   border: "border-rose-300",   btn: "bg-rose-600 hover:bg-rose-700" },
          };
          const t = THEME[personalCard?.theme ?? "teal"] ?? THEME.teal;
          return (
            <div className={`rounded-2xl shadow-md p-8 border-2 text-center ${t.bg} ${t.border}`}>
              {personalCard ? (
                <>
                  <div className="text-6xl mb-4">{personalCard.emoji}</div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">{personalCard.headline}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">{personalCard.message}</p>
                  <button
                    onClick={handleSeeRecommendations}
                    disabled={pendingRecs === null}
                    className={`w-full text-white font-semibold py-4 rounded-xl transition-colors ${t.btn} disabled:opacity-50 disabled:cursor-wait`}
                  >
                    {pendingRecs === null ? "Preparing your recommendations..." : "See my recommendations →"}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                  </div>
                  <p className="text-gray-500 text-sm">Personalising your experience...</p>
                </>
              )}
            </div>
          );
        })()}

        {/* ── MAIN STEPS ── */}
        {!["emergency", "personal", "result"].includes(step) && (
          <div className="bg-white rounded-2xl shadow-md p-7">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Step {currentNum} of {TOTAL_STEPS}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-teal-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* ── STEP 1: Safety ── */}
            {step === "safety" && (
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Question 1 of {TOTAL_STEPS} — Safety check</p>
                <h2 className="text-xl font-bold text-slate-800 mb-1 leading-snug">Sometimes people going through hard times have thoughts of ending their life. Has that ever been the case for you?</h2>
                <p className="text-gray-400 text-xs mb-5">Your answer is confidential and helps us connect you with the right support.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: "never", label: "No, never" },
                    { val: "past",  label: "In the past, not now" },
                    { val: "now",   label: "I'm having these thoughts now" },
                  ].map(o => (
                    <button
                      key={o.val}
                      onClick={() => {
                        const updated = { ...data, safetyA: o.val };
                        setData(updated);
                        if (o.val === "now") setStep("emergency");
                      }}
                      className={`${chipBase} ${data.safetyA === o.val ? (o.val === "now" ? chipDanger : chipSel) : chipIdle}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                {data.safetyA === "past" && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Have you ever acted on those thoughts?</p>
                    <div className="flex gap-2">
                      {["No", "Yes"].map(o => (
                        <button
                          key={o}
                          onClick={() => setData({ ...data, safetyB: o.toLowerCase() })}
                          className={`${chipBase} ${data.safetyB === o.toLowerCase() ? chipSel : chipIdle}`}
                        >{o}</button>
                      ))}
                    </div>
                  </div>
                )}

                {(data.safetyA === "never" || (data.safetyA === "past" && data.safetyB)) && (
                  <button
                    onClick={() => setStep("who")}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl transition-colors"
                  >Continue →</button>
                )}
              </div>
            )}

            {/* ── STEP 2: Who ── */}
            {step === "who" && (
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Question 2 of {TOTAL_STEPS}</p>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Who are you completing this for?</h2>
                <p className="text-gray-400 text-xs mb-5">This helps us tailor the recommendations.</p>
                <div className="flex flex-wrap gap-2">
                  {[{ val: "self", label: "Myself" }, { val: "other", label: "Someone I'm worried about" }].map(o => (
                    <button
                      key={o.val}
                      onClick={() => { setData({ ...data, forSelf: o.val }); setStep("about"); }}
                      className={`${chipBase} ${data.forSelf === o.val ? chipSel : chipIdle}`}
                    >{o.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: About ── */}
            {step === "about" && (
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Question 3 of {TOTAL_STEPS}</p>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Tell us a little about {data.forSelf === "other" ? "them" : "yourself"}</h2>
                <p className="text-gray-400 text-xs mb-5">Helps us personalise support options.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nickname</label>
                    <input
                      type="text"
                      value={data.nickname}
                      onChange={e => setData({ ...data, nickname: e.target.value })}
                      placeholder={data.forSelf === "other" ? "e.g. their nickname" : "What should we call you?"}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Age group</label>
                    <div className="flex flex-wrap gap-2">
                      {AGE_GROUPS.map(o => (
                        <button key={o.value} onClick={() => setData({ ...data, ageGroup: o.value })}
                          className={`${chipBase} ${data.ageGroup === o.value ? chipSel : chipIdle}`}>{o.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender</label>
                    <div className="flex flex-wrap gap-2">
                      {GENDERS.map(o => (
                        <button key={o.value} onClick={() => setData({ ...data, gender: o.value })}
                          className={`${chipBase} ${data.gender === o.value ? chipSel : chipIdle}`}>{o.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {data.ageGroup && data.gender && (
                  <button onClick={() => setStep("mood")}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl transition-colors">
                    Continue →
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 4: Mood matrix ── */}
            {step === "mood" && (
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Question 4 of {TOTAL_STEPS}</p>
                <h2 className="text-xl font-bold text-slate-800 mb-1">How often {data.forSelf === "other" ? "do they" : "do you"} experience these feelings?</h2>
                <p className="text-gray-400 text-xs mb-5">Select one answer per row.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-3 w-2/5"></th>
                        {FREQ_COLS.map(col => (
                          <th key={col} className="text-center text-xs text-gray-400 font-medium pb-3 px-1">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOOD_ROWS.map(row => (
                        <tr key={row.key} className="border-t border-gray-100">
                          <td className="py-3 pr-3 text-gray-700 text-xs leading-tight">{row.label}</td>
                          {[0, 1, 2, 3].map(v => {
                            const selected = data.mood[row.key as keyof MoodScores] === v;
                            const isHigh = v >= 2;
                            return (
                              <td key={v} className="text-center py-3 px-1">
                                <button
                                  onClick={() => setMood(row.key as keyof MoodScores, v)}
                                  className={`w-7 h-7 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${
                                    selected
                                      ? isHigh ? "bg-amber-500 border-amber-500" : "bg-teal-600 border-teal-600"
                                      : "border-gray-200 bg-gray-50 hover:border-teal-400"
                                  }`}
                                >
                                  {selected && <span className="w-2.5 h-2.5 rounded-full bg-white block" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {Object.values(data.mood).filter(v => v >= 0).length >= 3 && (
                  <button onClick={() => setStep("stressors")}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl transition-colors">
                    Continue →
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 5: Stressors ── */}
            {step === "stressors" && (
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Question 5 of {TOTAL_STEPS}</p>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Have {data.forSelf === "other" ? "they" : "you"} experienced any of these recently?</h2>
                <p className="text-gray-400 text-xs mb-5">Select all that apply.</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {STRESSOR_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => toggleStressor(o.value)}
                      className={`${chipBase} ${data.stressors.includes(o.value) ? chipSel : chipIdle}`}
                    >{o.label}</button>
                  ))}
                  <button
                    onClick={() => toggleStressor("none")}
                    className={`${chipBase} ${data.stressors.length === 0 ? chipSel : chipIdle}`}
                  >None of the above</button>
                </div>
                <button
                  onClick={() => setStep("background")}
                  className="w-full mt-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl transition-colors"
                >Continue →</button>
              </div>
            )}

            {/* ── STEP 6: Background ── */}
            {step === "background" && (
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Question 6 of {TOTAL_STEPS}</p>
                <h2 className="text-xl font-bold text-slate-800 mb-5">A couple more questions to find the best fit</h2>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Have {data.forSelf === "other" ? "they" : "you"} tried professional mental health support before?</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { val: "yes_helped",     label: "Yes, and it helped" },
                        { val: "yes_not_helped", label: "Yes, but it didn't help" },
                        { val: "no",             label: "No, not yet" },
                      ].map(o => (
                        <button key={o.val} onClick={() => setData({ ...data, prevSupport: o.val })}
                          className={`${chipBase} ${data.prevSupport === o.val ? chipSel : chipIdle}`}>{o.label}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Are {data.forSelf === "other" ? "they" : "you"} an NDIS participant?</p>
                    <div className="flex gap-2">
                      {["Yes", "No"].map(o => (
                        <button key={o} onClick={() => setData({ ...data, isNDIS: o.toLowerCase() })}
                          className={`${chipBase} ${data.isNDIS === o.toLowerCase() ? chipSel : chipIdle}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {data.prevSupport && data.isNDIS && (
                  <button
                    onClick={() => handleBackground(data.prevSupport, data.isNDIS)}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl transition-colors"
                  >Find my recommended services →</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && (
          <div className="bg-white rounded-2xl shadow-md p-7">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">💚</div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                {data.forSelf === "other" ? "Recommended services for your person" : `Your recommended services${data.nickname ? `, ${data.nickname}` : ""}`}
              </h2>
              <p className="text-gray-500 text-sm">Based on your answers, here are 3 services from the Evolve Hub best suited to your needs.</p>
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
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>{r.category}</span>
                      {r.status && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[r.status] ?? "bg-gray-200 text-gray-600"}`}>{r.status}</span>}
                    </div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{r.title}</p>
                    {r.subtitle && <p className={`text-xs font-medium mt-0.5 mb-2 ${s.badge.split(" ")[1]}`}>{r.subtitle}</p>}
                    {r.provider_contact && <p className="text-gray-500 text-xs mb-2">{r.provider_contact}</p>}
                    <p className="text-gray-600 text-xs leading-relaxed mb-3 flex-1">{r.description}</p>
                    <div className="space-y-1.5 mb-3">
                      {r.address && <p className="text-gray-500 text-xs flex items-center gap-1"><span>📍</span>{r.address}</p>}
                      {r.areas && r.areas.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.areas.map(a => <span key={a} className="bg-white/60 border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-md">{a}</span>)}
                        </div>
                      )}
                      {r.phone && <p className="text-gray-500 text-xs flex items-center gap-1"><span>📞</span>{r.phone}</p>}
                      {r.wait_time && <p className="text-gray-500 text-xs flex items-center gap-1"><span>⏱</span>Wait: {r.wait_time}</p>}
                    </div>
                    <a
                      href={r.href}
                      target={r.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={r.href === "/chat" ? e => { e.preventDefault(); router.push("/chat"); } : undefined}
                      className={`inline-block text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${s.btn}`}
                    >{r.action} →</a>
                  </div>
                );
              })}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-600 flex gap-2 items-start">
              <span>⚠️</span>
              <span>These recommendations are not a clinical assessment. If your needs change or you feel unsafe, call Lifeline <a href="tel:131114" className="font-bold underline">13 11 14</a> or <a href="tel:000" className="font-bold underline">000</a>.</span>
            </div>

            {!showBooking ? (
              <button onClick={() => setShowBooking(true)} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors mb-3">
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
                <p className="font-semibold text-gray-800 text-sm">Book at Evolve Hub</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full name</label>
                  <input required type="text" value={booking.name} onChange={e => setBooking({ ...booking, name: e.target.value })} placeholder="Your name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone number</label>
                  <input required type="tel" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} placeholder="04XX XXX XXX" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input required type="date" value={booking.date} min={new Date().toISOString().split("T")[0]} onChange={e => setBooking({ ...booking, date: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Time</label>
                    <select required value={booking.time} onChange={e => setBooking({ ...booking, time: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white">
                      <option value="">Select...</option>
                      {["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowBooking(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm py-2 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">Submit</button>
                </div>
              </form>
            )}

            <button onClick={resetAll} className="w-full text-gray-400 text-xs underline hover:text-gray-600 py-2">Start over</button>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs mt-6">Anonymous · Not a substitute for professional care · LMNSPN 2026</p>
      </main>
    </div>
  );
}
