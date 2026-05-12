"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white text-lg">
            📋
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-base leading-tight">Mental Health Check Point</h1>
            <p className="text-gray-500 text-xs">The Lake Macquarie & Newcastle Suicide Prevention Network</p>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Simple 5 Minute Mental Health Check Point
            </h2>
            <p className="text-teal-600 text-sm leading-relaxed">
              This brief check point will help us understand your current wellbeing and provide personalised support recommendations.
            </p>
          </div>

          {/* 3 Features */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div>
              <div className="text-2xl mb-1">⏱️</div>
              <p className="font-semibold text-slate-700 text-sm">5-10 Minutes</p>
              <p className="text-teal-500 text-xs">Quick and easy</p>
            </div>
            <div>
              <div className="text-2xl mb-1">🔒</div>
              <p className="font-semibold text-slate-700 text-sm">Confidential</p>
              <p className="text-teal-500 text-xs">Privacy protected</p>
            </div>
            <div>
              <div className="text-2xl mb-1">✨</div>
              <p className="font-semibold text-slate-700 text-sm">Personalised</p>
              <p className="text-teal-500 text-xs">Tailored recommendations</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="font-semibold text-blue-800 text-sm mb-2">Privacy Notice</p>
            <p className="text-blue-700 text-sm mb-2">
              Your responses are confidential and will be used solely to provide you with personalised mental health support recommendations. Your personal data will only be stored if you ask us to contact you and will not be shared without your consent.
            </p>
            <p className="text-blue-500 text-xs italic">
              Please note that the personalised results are AI generated based on a custom algorithm, however from time to time incorrect data may be provided or online business details may change. Should this occur please call Evolve hub and we will provide you up to date information.
            </p>
          </div>

          {/* Crisis Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-2">
            <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
            <p className="text-red-700 text-sm">
              If you are in immediate crisis, please call Lifeline on{" "}
              <a href="tel:131114" className="font-bold underline">13 11 14</a>{" "}
              or emergency services on{" "}
              <a href="tel:000" className="font-bold underline">000</a>.
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 mb-8 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-teal-600 flex-shrink-0"
            />
            <span className="text-gray-700 text-sm">
              I acknowledge that I have read and understood the privacy notice and AI disclaimer statements above.
            </span>
          </label>

          {/* Begin Button */}
          <button
            onClick={() => acknowledged && router.push("/assessment/questions")}
            disabled={!acknowledged}
            className={`w-full py-4 rounded-xl font-semibold text-white text-base transition-all ${
              acknowledged
                ? "bg-teal-500 hover:bg-teal-600 cursor-pointer shadow-md"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Begin Simple 5 Minute Mental Health Check Point
          </button>
        </div>
      </main>
    </div>
  );
}
