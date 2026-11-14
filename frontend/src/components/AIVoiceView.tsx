import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Globe,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Languages,
  Radio,
  Clock,
} from 'lucide-react';
import {
  type VoiceAgentInfo,
  type CallLogItem,
  callbackRequestService,
} from '../services/api';

export const AIVoiceView: React.FC = () => {
  const [agentInfo, setAgentInfo] = useState<VoiceAgentInfo | null>(null);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Dispatch form state
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const fetchVoiceData = async () => {
    setLoading(true);
    try {
      const [info, logsRes] = await Promise.all([
        callbackRequestService.getAgentInfo(),
        callbackRequestService.getCallLogs(),
      ]);
      setAgentInfo(info);
      setCallLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load voice agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoiceData();
  }, []);

  const handleDispatchCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatching(true);
    setDispatchSuccess(null);
    setDispatchError(null);

    try {
      const res = await callbackRequestService.dispatchTestCall({
        customer_name: customerName,
        phone_number: phoneNumber,
        language: selectedLanguage,
      });

      if (res.success) {
        setDispatchSuccess(res.message);
        setCustomerName('');
        setPhoneNumber('');
        // Refresh logs
        const updatedLogs = await callbackRequestService.getCallLogs();
        setCallLogs(updatedLogs.logs);

        setTimeout(() => setDispatchSuccess(null), 4000);
      }
    } catch (err: any) {
      console.error('Test call dispatch failed:', err);
      setDispatchError(
        err?.response?.data?.detail || 'Unable to dispatch test call. Please check backend.'
      );
    } finally {
      setDispatching(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-wider">
            VOICE INTELLIGENCE & TELEPHONY
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
            Sarvam AI Voice Operations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Multilingual AI Voice Agent telephony, language configuration, and automated callback tool integration.
          </p>
        </div>

        <button
          onClick={fetchVoiceData}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Agent Status
        </button>
      </div>

      {/* READINESS & SPECIFICATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AGENT ENGINE CARD */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Voice Agent Engine
            </span>
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
              {agentInfo?.engine_readiness || 'Configured – Draft'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">
              {agentInfo?.agent_name || 'AI Sales Care'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Provider: {agentInfo?.provider || 'Sarvam AI Voice Agents'}
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Agent ID:</span>
              <code className="text-blue-600 font-mono text-[11px] bg-blue-50 px-1 py-0.5 rounded">
                {agentInfo?.agent_id || 'AI-Sales-Ca-611ae4e3-6bce'}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="font-medium text-gray-800">{agentInfo?.version || 'v1 Draft'}</span>
            </div>
          </div>
        </div>

        {/* TELEPHONY READINESS */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Telephony Integration
            </span>
            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
              {agentInfo?.voice_readiness || 'Deployment not verified'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">
              Outbound & Inbound SIP
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Test calls dispatched; production SIP verification pending.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Test Calls Dispatched:</span>
              <span className="font-semibold text-gray-900">{callLogs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Speech Latency Target:</span>
              <span className="font-semibold text-emerald-600">&lt; 400ms</span>
            </div>
          </div>
        </div>

        {/* CALLBACK TOOL CARD */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Connected Tool
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
              Operational – Tested
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <FileCode size={16} className="text-blue-600" />
              save_callback_request
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              HTTPS REST tool invoked mid-call to persist callback requests.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Target Endpoint:</span>
              <code className="text-gray-700 font-mono text-[11px]">/api/v1/voice/callbacks</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Authentication:</span>
              <span className="text-emerald-700 font-medium">VOICE_API_KEY (Verified)</span>
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH TEST CALL & LANGUAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* OUTBOUND TEST CALL DISPATCHER (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <PhoneCall size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Dispatch Outbound Test Call
                </h3>
                <p className="text-xs text-gray-500">
                  Trigger an AI Voice conversation to test multilingual qualification & callback capture
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
              <Radio size={12} className="animate-pulse text-blue-600" />
              Simulator Active
            </span>
          </div>

          {dispatchSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{dispatchSuccess}</span>
            </div>
          )}

          {dispatchError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{dispatchError}</span>
            </div>
          )}

          <form onSubmit={handleDispatchCall} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Customer Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Harsha Vardhan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target Phone Number *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 6305974808"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Conversation Language *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { lang: 'English', desc: 'Default Business' },
                  { lang: 'Telugu', desc: 'తెలుగు (Regional)' },
                  { lang: 'Hindi', desc: 'हिन्दी (National)' },
                ].map((item) => (
                  <button
                    key={item.lang}
                    type="button"
                    onClick={() => setSelectedLanguage(item.lang)}
                    className={`p-3 rounded-lg border text-left transition ${
                      selectedLanguage === item.lang
                        ? 'border-blue-500 bg-blue-50/70 text-blue-700 ring-2 ring-blue-500/10'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.lang}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={dispatching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs disabled:opacity-50"
              >
                {dispatching ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Dispatching Call...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Dispatch Test Call</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SUPPORTED LANGUAGES & GUARDRAILS (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Languages size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Multilingual Voice Guidelines
            </h3>
          </div>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="p-3 bg-gray-50 rounded-lg space-y-1 border border-gray-100">
              <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Globe size={13} className="text-blue-600" />
                Automatic Language Detection
              </p>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Agent naturally identifies customer language preference (English, Telugu, or Hindi) and continues fluently.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg space-y-1 border border-gray-100">
              <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                Accuracy & Anti-Hallucination Guardrails
              </p>
              <ul className="text-gray-500 text-[11px] list-disc list-inside space-y-0.5">
                <li>Never invents pricing or unapproved business terms</li>
                <li>Collects 4 required fields before invoking callback tool</li>
                <li>Confirms callback request is awaiting human review</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH AUDIT LOGS TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-gray-900">
              Voice Dispatch & Telephony Audit Logs
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Transparent operational logs of dispatched test calls and telephony activities
            </p>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
            {callLogs.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Call ID</th>
                <th className="px-5 py-3 whitespace-nowrap">Recipient</th>
                <th className="px-5 py-3 whitespace-nowrap">Phone</th>
                <th className="px-5 py-3 whitespace-nowrap">Language</th>
                <th className="px-5 py-3 whitespace-nowrap">Status</th>
                <th className="px-5 py-3 whitespace-nowrap">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {callLogs.map((log) => (
                <tr key={log.call_id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-mono text-gray-600 whitespace-nowrap">
                    {log.call_id}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {log.customer_name}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">{log.phone_number}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium text-[11px]">
                      {log.language}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                      <Clock size={11} />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-gray-500">
                    {formatDate(log.dispatched_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
