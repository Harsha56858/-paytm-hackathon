import React, { useState } from 'react';
import {
  Inbox,
  Search,
  Sparkles,
  Phone,
  Mail,
  CalendarDays,
  User,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import {
  type Enquiry,
  type QualifyResponse,
  enquiryService,
} from '../services/api';

interface AIInboxViewProps {
  enquiries: Enquiry[];
  loading: boolean;
  onRefresh: () => void;
}

export const AIInboxView: React.FC<AIInboxViewProps> = ({
  enquiries,
  loading,
  onRefresh,
}) => {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    enquiries[0]?.id || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [qualifying, setQualifying] = useState(false);
  const [qualificationResults, setQualificationResults] = useState<
    Record<string, QualifyResponse['ai_analysis']>
  >({});
  const [qualifyError, setQualifyError] = useState<string | null>(null);
  const [copiedFollowUp, setCopiedFollowUp] = useState(false);

  const selectedEnquiry =
    enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0] || null;

  const filteredEnquiries = enquiries.filter((e) => {
    if (sourceFilter !== 'all' && e.source !== sourceFilter) return false;
    const s = searchTerm.toLowerCase().trim();
    if (s) {
      const matchName = e.customer_name.toLowerCase().includes(s);
      const matchPhone = e.phone_number.includes(s);
      const matchMsg = e.message.toLowerCase().includes(s);
      if (!matchName && !matchPhone && !matchMsg) return false;
    }
    return true;
  });

  const handleRunGemini = async (enquiryId: string) => {
    setQualifying(true);
    setQualifyError(null);
    try {
      const res = await enquiryService.qualify(enquiryId);
      if (res.success && res.ai_analysis) {
        setQualificationResults((prev) => ({
          ...prev,
          [enquiryId]: res.ai_analysis,
        }));
      }
    } catch (err: any) {
      console.error('Gemini qualification failed:', err);
      setQualifyError(
        err?.response?.data?.detail ||
          'Gemini AI qualification service temporarily unavailable. Please retry.'
      );
    } finally {
      setQualifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFollowUp(true);
    setTimeout(() => setCopiedFollowUp(false), 2000);
  };

  const currentAnalysis = selectedEnquiry
    ? qualificationResults[selectedEnquiry.id]
    : null;

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
            CONVERSATION INTELLIGENCE
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
            AI Inbox & Qualification
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Real customer enquiries with instant Google Gemini 3.8 Flash lead qualification, sentiment analysis, and action recommendations.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Inbox
        </button>
      </div>

      {/* TWO-COLUMN INBOX WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* LEFT: CONVERSATION LIST (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          {/* SEARCH & FILTERS */}
          <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs outline-none border border-gray-200 rounded-lg bg-white focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['all', 'website', 'dashboard', 'voice'].map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setSourceFilter(source)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition ${
                    sourceFilter === source
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* LIST ITEMS */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[580px]">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-xs">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-blue-500" />
                Loading conversations...
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-xs">
                <Inbox size={28} className="mx-auto mb-2 text-gray-300" />
                No customer messages found.
              </div>
            ) : (
              filteredEnquiries.map((enquiry) => {
                const isSelected = selectedEnquiry?.id === enquiry.id;
                const hasAnalysis = !!qualificationResults[enquiry.id];

                return (
                  <button
                    key={enquiry.id}
                    type="button"
                    onClick={() => setSelectedEnquiryId(enquiry.id)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                        : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {enquiry.customer_name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(enquiry.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {enquiry.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium capitalize">
                        {enquiry.source}
                      </span>
                      {hasAnalysis && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-emerald-200/50">
                          <Sparkles size={10} />
                          AI Qualified
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: CONVERSATION DETAIL & GEMINI QUALIFIER (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          {selectedEnquiry ? (
            <div className="flex-1 flex flex-col overflow-y-auto max-h-[680px]">
              {/* DETAIL HEADER */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-base">
                    <User size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedEnquiry.customer_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enquiry ID: <code className="text-gray-600 bg-gray-100 px-1 py-0.5 rounded">{selectedEnquiry.id}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                    <Phone size={13} className="text-gray-400" />
                    <span>{selectedEnquiry.phone_number}</span>
                  </div>
                  {selectedEnquiry.email && (
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                      <Mail size={13} className="text-gray-400" />
                      <span>{selectedEnquiry.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* MESSAGE CONTENT */}
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare size={13} />
                    Customer Message & Requirement
                  </p>
                  <div className="bg-[#f7f9fd] border border-gray-200/70 rounded-xl p-4 text-sm text-gray-800 leading-relaxed shadow-2xs">
                    {selectedEnquiry.message}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <CalendarDays size={12} />
                    Received: {formatDate(selectedEnquiry.created_at)} via {selectedEnquiry.source}
                  </p>
                </div>

                {/* GEMINI AI QUALIFICATION SECTION */}
                <div className="border border-blue-100 bg-blue-50/20 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <Sparkles size={15} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          Google Gemini 3.8 Flash Lead Analysis
                        </h4>
                        <p className="text-xs text-gray-500">
                          Automated customer qualification, sentiment, & recommended response
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRunGemini(selectedEnquiry.id)}
                      disabled={qualifying}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs disabled:opacity-50"
                    >
                      {qualifying ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Analysing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>{currentAnalysis ? 'Re-Analyse' : 'Run Gemini Analysis'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {qualifyError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{qualifyError}</span>
                    </div>
                  )}

                  {currentAnalysis ? (
                    <div className="space-y-3.5 pt-2">
                      {/* PRIORITY & SENTIMENT BADGES */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
                          <span className="text-gray-500">Lead Priority:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              currentAnalysis.lead_priority === 'High'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : currentAnalysis.lead_priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {currentAnalysis.lead_priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
                          <span className="text-gray-500">Customer Sentiment:</span>
                          <span className="font-semibold text-gray-800">
                            {currentAnalysis.customer_sentiment}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
                          <TrendingUp size={13} className="text-blue-500" />
                          <span className="text-gray-500">Intent:</span>
                          <span className="font-semibold text-gray-800">
                            {currentAnalysis.intent}
                          </span>
                        </div>
                      </div>

                      {/* SUMMARY */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3.5 text-xs space-y-1">
                        <p className="font-semibold text-gray-700">Executive Summary</p>
                        <p className="text-gray-600 leading-relaxed">{currentAnalysis.summary}</p>
                      </div>

                      {/* RECOMMENDED ACTION */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3.5 text-xs space-y-1">
                        <p className="font-semibold text-gray-700">Recommended Next Action</p>
                        <p className="text-gray-600 leading-relaxed">{currentAnalysis.recommended_action}</p>
                      </div>

                      {/* PERSONALIZED FOLLOW-UP DRAFT */}
                      <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-blue-900">
                            Personalized Follow-Up Draft
                          </p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(currentAnalysis.follow_up_message)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition"
                          >
                            {copiedFollowUp ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy Message</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-700 italic bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                          "{currentAnalysis.follow_up_message}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-500 space-y-2">
                      <p>
                        Click <strong>Run Gemini Analysis</strong> to automatically classify intent, assign lead priority, and generate a tailored follow-up reply using Google Gemini 3.8 Flash.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-400">
              Select an enquiry from the list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
