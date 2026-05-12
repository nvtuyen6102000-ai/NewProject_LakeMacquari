"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Booking {
  clientId: string;
  nickname: string;
  phone: string;
  date: string;
  time: string;
  submittedAt: string;
}

interface ClientSnapshot {
  clientId: string;
  createdAt: string;
  triageData: {
    nickname: string;
    forSelf: string;
    ageGroup: string;
    gender: string;
    mood: Record<string, number>;
    stressors: string[];
    prevSupport: string;
    isNDIS: string;
    safetyA: string;
    safetyB: string;
  };
  recommendations?: { title: string; category: string; description: string }[];
}

const STATUS_OPTIONS = ["Pending", "Confirmed", "Completed", "Cancelled"];
const STATUS_COLORS: Record<string, string> = {
  Pending:   "bg-amber-100 text-amber-700",
  Confirmed: "bg-teal-100 text-teal-700",
  Completed: "bg-gray-100 text-gray-500",
  Cancelled: "bg-red-100 text-red-600",
};

const AGE_LABEL: Record<string, string> = { child: "Under 12", teen: "12–17", young_adult: "18–24", adult: "25–64", older: "65+" };
const GENDER_LABEL: Record<string, string> = { male: "Man", female: "Woman", nonbinary: "Non-binary", undisclosed: "Prefer not to say" };
const SUPPORT_LABEL: Record<string, string> = { yes_helped: "Yes, and it helped", yes_not_helped: "Yes, but didn't help", no: "No, not yet" };
const SAFETY_LABEL: Record<string, string> = { never: "No, never", past: "In the past, not now", now: "Currently experiencing" };
const MOOD_ROWS = ["Overwhelmed/stressed", "Sad/depressed", "Anxious/worried", "Irritable/angry", "Lonely/isolated"];
const FREQ_COLS = ["Never", "Sometimes", "Often", "Always"];

export default function StaffPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<ClientSnapshot[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [tab, setTab] = useState<"appointments" | "overview">("appointments");
  const [selectedClient, setSelectedClient] = useState<ClientSnapshot | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("evolve_bookings");
    if (raw) setBookings(JSON.parse(raw));
    const rawClients = localStorage.getItem("evolve_clients");
    if (rawClients) setClients(JSON.parse(rawClients));
    const savedStatuses = localStorage.getItem("evolve_statuses");
    if (savedStatuses) setStatuses(JSON.parse(savedStatuses));
  }, []);

  function updateStatus(clientId: string, status: string) {
    const updated = { ...statuses, [clientId]: status };
    setStatuses(updated);
    localStorage.setItem("evolve_statuses", JSON.stringify(updated));
  }

  function clearBooking(clientId: string) {
    const updated = bookings.filter(b => b.clientId !== clientId);
    setBookings(updated);
    localStorage.setItem("evolve_bookings", JSON.stringify(updated));
  }

  const filtered = bookings.filter(b => {
    const matchSearch = search === "" ||
      b.clientId.toLowerCase().includes(search.toLowerCase()) ||
      b.nickname.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || (statuses[b.clientId] ?? "Pending") === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = bookings.filter(b => (statuses[b.clientId] ?? "Pending") === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏥</div>
              <div>
                <h1 className="font-bold text-sm leading-tight">Evolve Hub — Staff Portal</h1>
                <p className="text-slate-400 text-xs">Lake Macquarie & Newcastle Suicide Prevention Network</p>
              </div>
            </Link>
          </div>
          <a href="/triage" className="text-xs text-slate-400 hover:text-white border border-slate-600 px-3 py-1.5 rounded-lg transition-colors">
            ← Client View
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-slate-800">{bookings.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total appointments</p>
          </div>
          {STATUS_OPTIONS.map(s => (
            <div key={s} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-2xl font-bold text-slate-800">{counts[s] ?? 0}</p>
              <p className={`text-xs mt-0.5 font-medium inline-block px-2 py-0.5 rounded-full ${STATUS_COLORS[s]}`}>{s}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
          {(["appointments", "overview"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-gray-500 hover:text-slate-700"}`}
            >{t}</button>
          ))}
        </div>

        {/* ── APPOINTMENTS TAB ── */}
        {tab === "appointments" && (
          <>
            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or client ID..."
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-72 focus:outline-none focus:border-teal-400 bg-white"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400"
              >
                <option value="All">All statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-500 text-sm">No appointments yet.</p>
                <p className="text-gray-400 text-xs mt-1">Bookings submitted via the client portal will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Client ID", "Name", "Phone", "Date", "Time", "Submitted", "Status", ""].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, i) => {
                      const status = statuses[b.clientId] ?? "Pending";
                      return (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedClient(clients.find(c => c.clientId === b.clientId) ?? null)}
                              className="font-mono font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded text-xs transition-colors underline decoration-dotted"
                            >{b.clientId}</button>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">{b.nickname}</td>
                          <td className="px-4 py-3 text-gray-500">{b.phone}</td>
                          <td className="px-4 py-3 text-gray-700">{b.date}</td>
                          <td className="px-4 py-3 text-gray-700">{b.time}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(b.submittedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <select
                              value={status}
                              onChange={e => updateStatus(b.clientId, e.target.value)}
                              className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[status]}`}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => clearBooking(b.clientId)}
                              className="text-gray-300 hover:text-red-400 transition-colors text-xs"
                              title="Remove"
                            >✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm">Appointments by date</h3>
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-xs">No data yet.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(
                    bookings.reduce((acc, b) => { acc[b.date] = (acc[b.date] ?? 0) + 1; return acc; }, {} as Record<string, number>)
                  ).sort().map(([date, count]) => (
                    <div key={date} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">{date}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min((count / bookings.length) * 100 * 3, 100)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-4">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm">Evolve Hub — Active providers</h3>
              <div className="space-y-2 text-xs text-gray-600">
                {[
                  { name: "Kara Thomson Psychology", service: "Psychology", contact: "Kara Thomson" },
                  { name: "The Rosewood Centre", service: "Clinical Psychology", contact: "-" },
                  { name: "Constructive Thinking Counselling", service: "Counselling", contact: "Candice Sherriff" },
                  { name: "Bright Feathers", service: "Counselling", contact: "Mel Sebastian" },
                  { name: "Walk Within Art Therapy", service: "Art Therapy", contact: "Chelsea Arnold" },
                  { name: "Fearless Therapies", service: "Therapy", contact: "Simon Shields" },
                  { name: "SandWaves Therapy", service: "Therapy", contact: "Michael Bourke" },
                  { name: "Well Education", service: "Education", contact: "Laura Collison" },
                  { name: "Top Blokes Foundation", service: "Men's Support", contact: "Amy Harvison" },
                  { name: "Kintsugi OT", service: "Occupational Therapy", contact: "Nicholas Voican" },
                  { name: "Name.Narrate.Navigate", service: "Navigation", contact: "Daniel Ebbin" },
                  { name: "Gamble Aware", service: "Financial & Gambling", contact: "-" },
                  { name: "Phoenix Assist", service: "NDIS Coordination", contact: "-" },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-slate-700">{p.name}</p>
                      <p className="text-gray-400">{p.service} {p.contact !== "-" ? `· ${p.contact}` : ""}</p>
                    </div>
                    <span className="bg-teal-100 text-teal-600 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── CLIENT DETAIL MODAL ── */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <p className="text-xs text-gray-400">Client ID</p>
                <p className="font-mono font-bold text-teal-700 text-lg tracking-widest">{selectedClient.clientId}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Basic info */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">Nickname</p>
                    <p className="font-medium text-slate-700">{selectedClient.triageData.nickname || "—"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">For</p>
                    <p className="font-medium text-slate-700">{selectedClient.triageData.forSelf === "other" ? "Someone else" : "Themselves"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">Age group</p>
                    <p className="font-medium text-slate-700">{AGE_LABEL[selectedClient.triageData.ageGroup] ?? "—"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">Gender</p>
                    <p className="font-medium text-slate-700">{GENDER_LABEL[selectedClient.triageData.gender] ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* Safety */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Safety check</p>
                <div className={`rounded-lg px-3 py-2 text-sm ${selectedClient.triageData.safetyA === "now" ? "bg-red-50 text-red-700" : "bg-gray-50 text-slate-700"}`}>
                  {SAFETY_LABEL[selectedClient.triageData.safetyA] ?? "—"}
                  {selectedClient.triageData.safetyB && <span className="text-gray-400 ml-2 text-xs">· Acted on: {selectedClient.triageData.safetyB}</span>}
                </div>
              </div>

              {/* Mood matrix */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mood frequency</p>
                <div className="space-y-1.5">
                  {MOOD_ROWS.map((label, i) => {
                    const val = selectedClient.triageData.mood[`m${i + 1}`];
                    const isHigh = val >= 2;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map(v => (
                            <div key={v} className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${v === val ? (isHigh ? "bg-amber-400 text-white" : "bg-teal-500 text-white") : "bg-gray-100"}`}>
                              {v === val && "✓"}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{val >= 0 ? FREQ_COLS[val] : "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stressors */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent stressors</p>
                {selectedClient.triageData.stressors.length === 0 ? (
                  <p className="text-sm text-gray-400">None selected</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClient.triageData.stressors.map(s => (
                      <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full capitalize">{s.replace("_", " ")}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Background */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Background</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">Previous support</p>
                    <p className="font-medium text-slate-700">{SUPPORT_LABEL[selectedClient.triageData.prevSupport] ?? "—"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">NDIS participant</p>
                    <p className="font-medium text-slate-700">{selectedClient.triageData.isNDIS === "yes" ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {selectedClient.recommendations && selectedClient.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recommendations shown</p>
                  <div className="space-y-2">
                    {selectedClient.recommendations.map((r, i) => (
                      <div key={i} className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-teal-700">{r.category}</p>
                        <p className="text-sm font-medium text-slate-700">{r.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 text-center pt-2">
                Submitted {new Date(selectedClient.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
