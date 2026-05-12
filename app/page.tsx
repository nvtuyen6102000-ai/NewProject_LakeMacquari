import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Crisis banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4 text-xs font-medium">
        In immediate danger? Call <a href="tel:000" className="font-bold underline">000</a> · Lifeline 24/7: <a href="tel:131114" className="font-bold underline">13 11 14</a>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">E</div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">Mental Health Check Point</p>
              <p className="text-gray-400 text-xs">The Lake Macquarie & Newcastle Suicide Prevention Network</p>
            </div>
          </div>
          <a href="tel:131114" className="hidden sm:flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-full text-xs font-semibold hover:bg-red-100 transition-colors">
            🆘 Crisis: 13 11 14
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">

        {/* Hero card */}
        <div className="bg-teal-600 rounded-2xl p-8 text-white">
          <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest mb-2">Free · Anonymous · Available 24/7</p>
          <h1 className="text-3xl font-bold leading-tight mb-3">Your Wellbeing<br />Check Point</h1>
          <p className="text-teal-100 text-sm leading-relaxed mb-6 max-w-md">
            Answer a few questions to get personalised mental health support and find the right services in the Hunter Region.
          </p>
          <Link
            href="/triage"
            className="inline-block bg-white text-teal-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-teal-50 transition-colors shadow-sm"
          >
            Start Check-in →
          </Link>
          <p className="text-teal-200 text-xs mt-3">Takes about 3 minutes · No login required</p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">How it works</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: "1", title: "Answer 6 questions", desc: "About how you're feeling, recent stressors, and what kind of support you're looking for." },
              { step: "2", title: "Get your score", desc: "See your wellbeing score and a personalised reference name to use when visiting the Hub." },
              { step: "3", title: "Find support", desc: "Get matched to the right services at Evolve Hub and book an appointment if you need one." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2">{s.step}</div>
                <p className="font-semibold text-slate-700 text-xs mb-1">{s.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evolve Hub */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-teal-600 px-6 py-4">
            <p className="font-bold text-white text-base">Introducing Evolve Hub</p>
            <p className="text-teal-200 text-xs mt-0.5">Your Local Mental Health & Wellbeing Hub</p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              The Evolve Mental Health & Wellbeing Hub in Charlestown offers free, walk-in support for anyone experiencing mental health challenges. No appointment necessary.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                "Free information, advice and referral",
                "Trained support staff",
                "Follow-up care to ensure referrals work",
                "Walk-in, phone or email",
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-teal-500 font-bold mt-0.5 flex-shrink-0">·</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2 text-gray-600"><span>📍</span><a href="https://maps.google.com/?q=54+Ridley+St+Charlestown+NSW" target="_blank" rel="noopener" className="hover:text-teal-600 underline decoration-dotted">54 Ridley Street, Charlestown NSW</a></p>
              <p className="flex items-center gap-2 text-gray-600"><span>📞</span><a href="tel:0240961100" className="hover:text-teal-600 font-medium">02 4096 1100</a></p>
              <p className="flex items-center gap-2 text-gray-600"><span>🌐</span><a href="https://connectedtocare.com.au/evolve-hub" target="_blank" rel="noopener" className="hover:text-teal-600 underline decoration-dotted text-xs">connectedtocare.com.au/evolve-hub</a></p>
            </div>
          </div>
        </div>

        {/* Crisis + CTA row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-2xl p-5 text-white">
            <p className="font-bold text-sm mb-3">24/7 Crisis Support</p>
            <div className="space-y-2">
              {[
                { name: "Lifeline", number: "13 11 14", href: "tel:131114" },
                { name: "Beyond Blue", number: "1300 22 4636", href: "tel:1300224636" },
                { name: "Suicide Call Back", number: "1300 659 467", href: "tel:1300659467" },
                { name: "Emergency", number: "000", href: "tel:000" },
              ].map(c => (
                <a key={c.name} href={c.href} className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors">
                  <span className="text-slate-300 text-xs">{c.name}</span>
                  <span className="font-bold text-white text-xs">{c.number}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/triage" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl p-5 flex flex-col justify-between transition-colors">
              <p className="text-2xl mb-2">🧭</p>
              <p className="font-bold text-sm">Start Check-in</p>
              <p className="text-teal-200 text-xs mt-1">Get personalised support in 3 min</p>
            </Link>
            <Link href="/chat" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 flex flex-col justify-between transition-colors">
              <p className="text-2xl mb-2">💬</p>
              <p className="font-bold text-sm">Talk to AI Support</p>
              <p className="text-blue-200 text-xs mt-1">Available anytime, 24/7</p>
            </Link>
          </div>
        </div>

      </main>

      <footer className="max-w-3xl mx-auto px-4 py-8 text-center border-t border-gray-100 mt-4">
        <p className="text-gray-400 text-xs">© 2026 The Lake Macquarie & Newcastle Suicide Prevention Network</p>
        <p className="text-gray-300 text-xs mt-1">Not a substitute for professional care · Anonymous · Free</p>
      </footer>
    </div>
  );
}
