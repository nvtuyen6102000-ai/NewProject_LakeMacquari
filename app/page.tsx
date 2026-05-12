import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium">
        In immediate danger? Call{" "}
        <a href="tel:000" className="underline font-bold">000</a>{" "}
        | Lifeline 24/7:{" "}
        <a href="tel:131114" className="underline font-bold">13 11 14</a>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              E
            </div>
            <div>
              <h1 className="text-teal-700 font-bold text-lg leading-tight">Evolve Connect</h1>
              <p className="text-gray-500 text-xs">Mental Health Support - Hunter Region</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#services" className="hover:text-teal-600">Services</a>
            <a href="#about" className="hover:text-teal-600">About</a>
            <a href="tel:131114" className="bg-teal-600 text-white px-4 py-1.5 rounded-full hover:bg-teal-700">
              Crisis Line
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          You don&apos;t have to face this{" "}
          <span className="text-teal-600">alone</span>
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Free, confidential mental health support for the Lake Macquarie and Newcastle community.
          Talk to our AI support assistant anytime, and get connected to the right help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/triage"
            className="bg-teal-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-700 transition-colors shadow-md"
          >
            Get Support Now - Free
          </Link>
          <a
            href="#services"
            className="border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-50 transition-colors"
          >
            Find Services
          </a>
        </div>
        <p className="text-gray-400 text-sm mt-4">Anonymous · No login required · Available 24/7</p>
      </section>

      {/* Services */}
      <section id="services" className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-10">Support Services</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
              <div className="text-3xl mb-3">🌱</div>
              <h4 className="font-bold text-gray-800 mb-2">Evolve Hub</h4>
              <p className="text-gray-600 text-sm mb-3">
                Walk-in mental health & wellbeing hub. Psychology, counselling, art therapy, care navigation.
              </p>
              <p className="text-teal-700 text-sm font-medium">12 Smith St, Charlestown</p>
              <p className="text-gray-500 text-xs">Mon-Fri 9am-5pm · Free</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl mb-3">💬</div>
              <h4 className="font-bold text-gray-800 mb-2">Lifeline</h4>
              <p className="text-gray-600 text-sm mb-3">
                24/7 crisis support and suicide prevention. Trained counsellors available anytime.
              </p>
              <a href="tel:131114" className="text-blue-700 text-lg font-bold block">13 11 14</a>
              <p className="text-gray-500 text-xs">24 hours · Free</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <div className="text-3xl mb-3">🤝</div>
              <h4 className="font-bold text-gray-800 mb-2">Beyond Blue</h4>
              <p className="text-gray-600 text-sm mb-3">
                Mental health information and support for depression, anxiety, and suicide prevention.
              </p>
              <a href="tel:1300224636" className="text-purple-700 text-lg font-bold block">1300 22 4636</a>
              <p className="text-gray-500 text-xs">24 hours · Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 max-w-5xl mx-auto px-4">
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-3">About Evolve Connect</h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
            Evolve Connect is built in partnership with the Lake Macquarie & Newcastle Suicide Prevention
            Network (LMNSPN). Our AI assistant provides a safe space to talk — it will never diagnose
            or replace professional care, but will always help you find the right support.
          </p>
          <p className="text-red-500 text-xs mt-4 font-medium">
            This is not a crisis service. If you or someone else is in immediate danger, call 000.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
        <p>© 2026 Evolve Connect · Built for LMNSPN · Hunter Region, NSW Australia</p>
        <p className="mt-1 text-xs">Not a substitute for professional mental health care.</p>
      </footer>
    </main>
  );
}
