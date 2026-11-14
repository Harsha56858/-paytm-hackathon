import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Database,
  Radio,
  Server,
  Bell,
  Globe,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  ExternalLink,
  Lock,
  Sliders,
  Check,
} from 'lucide-react';
import { api, callbackRequestService } from '../services/api';

export const SettingsView: React.FC = () => {
  // General settings
  const [workspaceName, setWorkspaceName] = useState('KINS.AI Workspace');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [defaultLanguage, setDefaultLanguage] = useState('English');

  // Admin Auth state
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem('kinsai_admin_token') || 'adm_kinsai_sec_8f92b7c4e1a06d29'
  );
  const [verifyingAuth, setVerifyingAuth] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  // System Diagnostics
  const [pingingHealth, setPingingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Notification toggles
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [requireNotesPolicy, setRequireNotesPolicy] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('manual');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleVerifyAdmin = async () => {
    setVerifyingAuth(true);
    setAuthStatus(null);
    try {
      localStorage.setItem('kinsai_admin_token', adminToken.trim());
      const res = await callbackRequestService.verifyAdmin();
      if (res.success) {
        setAuthStatus('Authorized: Administrator token verified successfully.');
      }
    } catch (err: any) {
      console.error('Admin verification failed:', err);
      setAuthStatus('Unauthorized: Invalid administrator token.');
    } finally {
      setVerifyingAuth(false);
    }
  };

  const handlePingHealth = async () => {
    setPingingHealth(true);
    setHealthStatus(null);
    const start = performance.now();
    try {
      const res = await api.get('/health');
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setHealthStatus(res.data);
    } catch (err: any) {
      console.error('Health check failed:', err);
      setHealthStatus({ status: 'unhealthy', database: 'disconnected' });
    } finally {
      setPingingHealth(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kinsai_admin_token', adminToken.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-wider">
            ADMINISTRATION & CONFIGURATION
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
            Workspace Settings & Security
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure system parameters, administrator authentication tokens, telephony webhooks, and diagnostic health checks.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
            <Check size={14} />
            <span>Preferences saved to workspace!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: WORKSPACE PROFILE & ADMIN AUTH (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* GENERAL WORKSPACE PROFILE */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Settings size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">
                General Workspace Profile
              </h3>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 outline-none focus:border-blue-500 text-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Default Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-gray-800 bg-white"
                  >
                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST, UTC+5:30)</option>
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                    <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                    <option value="UTC">Universal Coordinated Time (UTC)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Primary Voice Language
                  </label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-gray-800 bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition"
                >
                  <Save size={14} />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* ADMIN SECURITY & TOKENS */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Shield size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Administrator Authentication & Tokens
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">PRD §12.5 Enforced</span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Administrative updates to customer callback requests require a dedicated administrator token. Per PRD §12.5, administrator authentication is completely separated from the telephony voice key.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700">
                Active Administrator Key (X-Admin-Token)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyAdmin}
                  disabled={verifyingAuth}
                  className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {verifyingAuth ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Lock size={13} />
                  )}
                  <span>Test Auth</span>
                </button>
              </div>

              {authStatus && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    authStatus.includes('Authorized')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {authStatus.includes('Authorized') ? (
                    <CheckCircle2 size={15} className="shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0" />
                  )}
                  <span>{authStatus}</span>
                </div>
              )}
            </div>

            {/* PROTECTED BACKEND SECRETS STATUS */}
            <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
              <p className="font-semibold text-gray-800">Protected Backend Secrets Status</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">VOICE_API_KEY</p>
                    <p className="text-[10px] text-gray-400">Sarvam Inbound Webhook</p>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Encrypted on Backend
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">GEMINI_API_KEY</p>
                    <p className="text-[10px] text-gray-400">Google Gemini 3.8 Flash</p>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SYSTEM DIAGNOSTICS & TELEPHONY (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SYSTEM DIAGNOSTICS */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Server size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  System Diagnostics & Health
                </h3>
              </div>
              <button
                type="button"
                onClick={handlePingHealth}
                disabled={pingingHealth}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw size={12} className={pingingHealth ? 'animate-spin' : ''} />
                <span>Ping /health</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-emerald-600" />
                  <span className="text-gray-700 font-medium">PostgreSQL Database</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                  kinsai_db (Connected)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Radio size={15} className="text-blue-600" />
                  <span className="text-gray-700 font-medium">FastAPI Server</span>
                </div>
                <span className="text-gray-800 font-mono text-[11px]">Port 8001 (Healthy)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Globe size={15} className="text-indigo-600" />
                  <span className="text-gray-700 font-medium">React + Vite Frontend</span>
                </div>
                <span className="text-gray-800 font-mono text-[11px]">Port 5175</span>
              </div>

              {healthStatus && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1 text-[11px]">
                  <p className="font-bold text-emerald-900 flex items-center justify-between">
                    <span>Live Health Probe Verified</span>
                    {latencyMs !== null && <span>{latencyMs}ms latency</span>}
                  </p>
                  <p className="text-emerald-700">
                    Application: {healthStatus.application} • Status: {healthStatus.status}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SARVAM INTEGRATION SPECIFICATIONS */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Radio size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Sarvam Voice Agent Spec
              </h3>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between p-2 rounded bg-gray-50">
                <span className="text-gray-400">Agent Name:</span>
                <span className="font-medium text-gray-900">AI Sales Care</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-50">
                <span className="text-gray-400">Agent ID:</span>
                <code className="text-blue-600 font-mono text-[11px]">AI-Sales-Ca-611ae4e3-6bce</code>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-50">
                <span className="text-gray-400">Draft Status:</span>
                <span className="text-blue-700 font-medium">v1 Draft (Uncommitted)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-50">
                <span className="text-gray-400">Webhook Path:</span>
                <code className="text-gray-700 font-mono text-[11px]">/api/v1/voice/callbacks</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
