import React, { useState } from 'react';
import {
  Workflow,
  ArrowRight,
  PhoneCall,
  Database,
  Users,
  ToggleLeft,
  ToggleRight,
  Zap,
  Globe,
} from 'lucide-react';

export const WorkflowsView: React.FC = () => {
  const [autoQualify, setAutoQualify] = useState(true);
  const [requireNotes, setRequireNotes] = useState(true);
  const [voiceToolGuard, setVoiceToolGuard] = useState(true);

  const workflowSteps = [
    {
      step: '01',
      title: 'Customer Inbound / Voice Call',
      actor: 'Customer',
      desc: 'Customer reaches out via phone call or website enquiry form.',
      icon: PhoneCall,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      step: '02',
      title: 'Multilingual AI Understanding',
      actor: 'Sarvam Voice Agent',
      desc: 'Agent identifies customer language (English, Telugu, Hindi), qualifies intent, and avoids hallucinations.',
      icon: Globe,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      step: '03',
      title: 'Tool Execution (save_callback_request)',
      actor: 'AI Mid-Call Action',
      desc: 'After collecting Name, Phone, Preferred Time, and Reason, invokes authenticated HTTPS webhook.',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      step: '04',
      title: 'PostgreSQL 18 Storage',
      actor: 'FastAPI Backend',
      desc: 'Authenticates VOICE_API_KEY, validates fields, and records callback with status "pending_review".',
      icon: Database,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      step: '05',
      title: 'Human-in-the-Loop Supervision',
      actor: 'Workspace Admin',
      desc: 'Administrator reviews customer request, makes contact, logs internal notes, and marks completed.',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-wider">
            PIPELINE ORCHESTRATION
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
            Sales Care Workflows & Business Rules
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Visual pipeline architecture showing how AI Voice, FastAPI, PostgreSQL, and human administrators coordinate follow-ups.
          </p>
        </div>
      </div>

      {/* VISUAL ARCHITECTURE PIPELINE */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Workflow size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">
              End-to-End Voice-to-CRM Pipeline
            </h3>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
            Pipeline Verified & Active
          </span>
        </div>

        {/* STEP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
          {workflowSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 relative group hover:border-blue-300 hover:bg-blue-50/20 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 font-mono">
                      STEP {s.step}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${s.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {s.actor}
                  </p>
                  <h4 className="text-xs font-bold text-gray-900 mt-1">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 items-center justify-center text-gray-400 shadow-2xs">
                    <ArrowRight size={11} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* WORKFLOW POLICY & AUTOMATION RULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">
              Auto-Qualify Enquiries
            </h4>
            <button
              type="button"
              onClick={() => setAutoQualify(!autoQualify)}
              className="text-blue-600 hover:text-blue-800"
            >
              {autoQualify ? <ToggleRight size={26} className="text-blue-600" /> : <ToggleLeft size={26} className="text-gray-400" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Automatically trigger Google Gemini 3.8 Flash to evaluate intent, urgency, and customer sentiment upon receiving customer enquiries.
          </p>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium inline-block">
            Engine: Gemini 3.8 Flash
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">
              Enforce Follow-Up Notes
            </h4>
            <button
              type="button"
              onClick={() => setRequireNotes(!requireNotes)}
              className="text-blue-600 hover:text-blue-800"
            >
              {requireNotes ? <ToggleRight size={26} className="text-blue-600" /> : <ToggleLeft size={26} className="text-gray-400" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Require administrators to record conversation notes and outcome reasons prior to completing or cancelling callback requests.
          </p>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium inline-block">
            Policy: Non-empty notes validation
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">
              4-Field Voice Tool Gate
            </h4>
            <button
              type="button"
              onClick={() => setVoiceToolGuard(!voiceToolGuard)}
              className="text-blue-600 hover:text-blue-800"
            >
              {voiceToolGuard ? <ToggleRight size={26} className="text-blue-600" /> : <ToggleLeft size={26} className="text-gray-400" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Guardrail ensuring Sarvam Voice agent only calls <code>save_callback_request</code> after obtaining Name, Phone, Preferred Time, and Reason.
          </p>
          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium inline-block">
            PRD §9.2 Compliant
          </span>
        </div>
      </div>
    </div>
  );
};
