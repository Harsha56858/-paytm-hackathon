import React, { useState } from 'react';
import {
  Sparkles,
  PhoneCall,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AIAgentsViewProps {
  onNavigateToVoice: () => void;
  onNavigateToInbox: () => void;
}

export const AIAgentsView: React.FC<AIAgentsViewProps> = ({
  onNavigateToVoice,
  onNavigateToInbox,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<'sarvam' | 'gemini' | 'coordinator'>('sarvam');

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-wider">
            AUTONOMOUS TEAMMATES
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
            AI Agents Directory & Configuration
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your autonomous AI teammates handling voice calls, customer qualification, and follow-up coordination.
          </p>
        </div>
      </div>

      {/* 3 AI AGENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* AGENT 1: SARVAM VOICE AGENT */}
        <div
          onClick={() => setSelectedAgent('sarvam')}
          className={`bg-white border rounded-xl p-5 cursor-pointer transition shadow-2xs relative ${
            selectedAgent === 'sarvam'
              ? 'border-blue-500 ring-2 ring-blue-500/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <PhoneCall size={20} />
            </div>
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Configured – Draft
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900">
            AI Sales Care (Voice Agent)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Sarvam AI Voice Agent • Multilingual Telephony
          </p>

          <p className="text-xs text-gray-600 mt-3 leading-relaxed">
            Conducts real-time voice calls in English, Telugu, and Hindi. Qualifies customer intent and triggers callback automation.
          </p>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">Agent ID:</span>
            <code className="text-blue-600 font-mono text-[11px] bg-blue-50 px-1 py-0.5 rounded">
              AI-Sales-Ca-611ae4e3-6bce
            </code>
          </div>
        </div>

        {/* AGENT 2: GEMINI LEAD QUALIFIER */}
        <div
          onClick={() => setSelectedAgent('gemini')}
          className={`bg-white border rounded-xl p-5 cursor-pointer transition shadow-2xs relative ${
            selectedAgent === 'gemini'
              ? 'border-blue-500 ring-2 ring-blue-500/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Operational – Connected
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900">
            Lead Qualifier AI
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Google Gemini 3.8 Flash • Deep Intent Analysis
          </p>

          <p className="text-xs text-gray-600 mt-3 leading-relaxed">
            Analyzes customer enquiries, classifies sentiment, assigns lead priority, and drafts personalized sales responses.
          </p>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">Model Engine:</span>
            <span className="font-semibold text-indigo-600">gemini-3.8-flash</span>
          </div>
        </div>

        {/* AGENT 3: CALLBACK COORDINATOR */}
        <div
          onClick={() => setSelectedAgent('coordinator')}
          className={`bg-white border rounded-xl p-5 cursor-pointer transition shadow-2xs relative ${
            selectedAgent === 'coordinator'
              ? 'border-blue-500 ring-2 ring-blue-500/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Operational – Tested
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900">
            Callback Operations Coordinator
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            FastAPI + PostgreSQL • State & Task Engine
          </p>

          <p className="text-xs text-gray-600 mt-3 leading-relaxed">
            Stores authenticated webhook payloads, tracks status transitions, manages admin follow-up notes, and enforces security.
          </p>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">Database Target:</span>
            <span className="font-semibold text-emerald-700">kinsai_db (PostgreSQL 18)</span>
          </div>
        </div>
      </div>

      {/* SELECTED AGENT DETAIL PANEL */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-6">
        {selectedAgent === 'sarvam' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Sarvam Voice Agent — AI Sales Care
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Voice configuration, mid-call callback tool execution, and language detection parameters
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToVoice}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs"
              >
                <span>Open Voice Telephony Studio</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Model Specifications
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Agent Identifier:</span>
                    <code className="text-gray-800 font-mono">AI-Sales-Ca-611ae4e3-6bce</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Voice Version:</span>
                    <span className="font-medium text-gray-800">v1 Draft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Supported Languages:</span>
                    <span className="font-medium text-blue-600">English, Telugu, Hindi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Response Latency:</span>
                    <span className="font-medium text-emerald-600">&lt; 400ms</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Configured Tools & Workflows
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2.5 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">save_callback_request</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200">
                      Webhook Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Tool runs during the voice conversation after collecting customer name, phone, preferred time, and reason.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Authentication: <code className="text-gray-700 font-mono">VOICE_API_KEY</code> header
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedAgent === 'gemini' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Google Gemini 3.8 Flash Lead Qualification Engine
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  LLM prompt engineering, structured JSON responses, and sales qualification rubric
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToInbox}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs"
              >
                <span>Open AI Inbox to Qualify</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Engine Parameters
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model Name:</span>
                    <span className="font-bold text-indigo-600">gemini-3.8-flash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Response MIME:</span>
                    <code className="text-gray-800 font-mono">application/json</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Retry Strategy:</span>
                    <span className="font-medium text-gray-800">3-tier exponential backoff</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SDK Version:</span>
                    <span className="font-medium text-gray-800">google-genai 3.3.0</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  JSON Output Schema
                </h4>
                <div className="bg-gray-900 text-gray-200 rounded-xl p-3.5 text-[11px] font-mono leading-relaxed overflow-x-auto">
                  {`{
  "intent": "Customer business requirement",
  "lead_priority": "High | Medium | Low",
  "customer_sentiment": "Positive | Neutral | Negative",
  "summary": "Executive briefing",
  "recommended_action": "Sales next step",
  "follow_up_message": "Personalized email/SMS draft"
}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedAgent === 'coordinator' && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Callback Operations Coordinator
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                FastAPI backend service orchestrating database persistence and human review queues
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                <p className="font-bold text-gray-900">Database Audit Columns</p>
                <ul className="space-y-1 list-disc list-inside text-gray-600 text-[11px]">
                  <li><code>created_at</code> (TIMESTAMPTZ) — Initial Sarvam request timestamp</li>
                  <li><code>updated_at</code> (TIMESTAMPTZ) — Last administrator action timestamp</li>
                  <li><code>follow_up_notes</code> (TEXT) — Human review notes</li>
                  <li><code>updated_by</code> (VARCHAR) — Administrator identifier</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                <p className="font-bold text-gray-900">Status State Machine</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono text-[10px]">pending_review</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono text-[10px]">contacted</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-[10px]">completed</span>
                  <span className="text-gray-400">|</span>
                  <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded font-mono text-[10px]">cancelled</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
