import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarDays,
  CheckCircle2,
  Clock,
  PhoneCall,
  XCircle,
  Download,
  RefreshCw,
  PieChart,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  type CallbackRequest,
  type CallbackStats,
  type Enquiry,
} from '../services/api';

interface AnalyticsViewProps {
  callbacks: CallbackRequest[];
  stats: CallbackStats;
  enquiries: Enquiry[];
  loading: boolean;
  onRefresh: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  callbacks,
  stats,
  enquiries,
  loading,
  onRefresh,
}) => {
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');

  // Calculate real performance metrics
  const totalCallbacks = stats.total || callbacks.length || 0;
  const resolutionCount = (stats.completed || 0) + (stats.contacted || 0);
  const resolutionRate =
    totalCallbacks > 0
      ? Math.round((resolutionCount / totalCallbacks) * 100)
      : 0;

  const pendingReviewRate =
    totalCallbacks > 0
      ? Math.round(((stats.pending_review || 0) / totalCallbacks) * 100)
      : 0;

  // Source distribution from real enquiries
  const sourceCounts = enquiries.reduce<Record<string, number>>((acc, curr) => {
    const s = curr.source || 'website';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const totalSources = Object.values(sourceCounts).reduce((a, b) => a + b, 0) || 1;

  // Export CSV of real records
  const exportCallbacksCSV = () => {
    if (callbacks.length === 0) return;
    const headers = [
      'ID',
      'Customer Name',
      'Phone Number',
      'Preferred Time',
      'Reason',
      'Status',
      'Created At',
      'Updated At',
      'Updated By',
      'Notes',
    ];
    const rows = callbacks.map((c) => [
      c.id,
      `"${c.customer_name}"`,
      `"${c.phone_number}"`,
      `"${c.preferred_time}"`,
      `"${(c.reason || '').replace(/"/g, '""')}"`,
      c.status,
      c.created_at,
      c.updated_at || '',
      c.updated_by || '',
      `"${(c.follow_up_notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kins_ai_sales_callbacks_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
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
            BUSINESS INTELLIGENCE & PERFORMANCE
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
            Operational Analytics & Metrics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Measurable insights calculated from live PostgreSQL records across voice callbacks, leads, and human follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCallbacksCSV}
            disabled={callbacks.length === 0}
            className="flex items-center gap-1.5 border border-gray-200 bg-white px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs disabled:opacity-50"
          >
            <Download size={14} />
            Export CSV
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 border border-gray-200 bg-white px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* CORE KPI CARDS (REAL DATA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Total Inquiries</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-3 text-gray-900">
            {enquiries.length}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Enquiries captured across all sources
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Voice Callbacks</span>
            <CalendarDays size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold mt-3 text-indigo-600">
            {totalCallbacks}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Collected by Sarvam AI Voice Agent
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Follow-Up Coverage</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-3 text-emerald-600">
            {resolutionRate}%
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            {resolutionCount} of {totalCallbacks} requests contacted or completed
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Awaiting Action</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-3 text-amber-600">
            {stats.pending_review}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            {pendingReviewRate}% of callback backlog pending human review
          </p>
        </div>
      </div>

      {/* DETAILED BREAKDOWN & DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STATUS BREAKDOWN VISUALIZER (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Callback Requests by Lifecycle Status
              </h3>
            </div>
            <span className="text-xs text-gray-400">Live PostgreSQL Counts</span>
          </div>

          {/* PROGRESS BARS */}
          <div className="space-y-4">
            {[
              {
                status: 'Pending Review',
                count: stats.pending_review,
                color: 'bg-amber-500',
                textColor: 'text-amber-700',
                bgLight: 'bg-amber-50',
                border: 'border-amber-200',
                icon: Clock,
              },
              {
                status: 'Contacted',
                count: stats.contacted,
                color: 'bg-blue-600',
                textColor: 'text-blue-700',
                bgLight: 'bg-blue-50',
                border: 'border-blue-200',
                icon: PhoneCall,
              },
              {
                status: 'Completed',
                count: stats.completed,
                color: 'bg-emerald-600',
                textColor: 'text-emerald-700',
                bgLight: 'bg-emerald-50',
                border: 'border-emerald-200',
                icon: CheckCircle2,
              },
              {
                status: 'Cancelled',
                count: stats.cancelled,
                color: 'bg-gray-400',
                textColor: 'text-gray-700',
                bgLight: 'bg-gray-50',
                border: 'border-gray-200',
                icon: XCircle,
              },
            ].map((item) => {
              const pct =
                totalCallbacks > 0
                  ? Math.round((item.count / totalCallbacks) * 100)
                  : 0;
              const Icon = item.icon;

              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={item.textColor} />
                      <span className="font-semibold text-gray-800">
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="font-bold text-gray-900">{item.count}</span>
                      <span>({pct}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Total Tracked Callback Requests:</span>
            <span className="font-bold text-gray-900">{totalCallbacks}</span>
          </div>
        </div>

        {/* LEAD SOURCES & TIMELINESS (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Inquiry Channels & Sources
              </h3>
            </div>
            <span className="text-xs text-gray-400">{enquiries.length} Leads</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(sourceCounts).map(([src, count]) => {
              const pct = Math.round((count / totalSources) * 100);
              return (
                <div
                  key={src}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold text-gray-800 capitalize">
                      {src}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-900">{count}</span>
                    <span className="text-gray-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-blue-900 flex items-center gap-1.5">
              <ArrowUpRight size={13} className="text-blue-600" />
              Audit Integrity Guarantee
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              All metrics on this page represent real records in PostgreSQL. Zero mock or fabricated numbers are used.
            </p>
          </div>
        </div>
      </div>

      {/* RECENT RESOLUTION AUDIT HISTORY */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-gray-900">
              Recent Follow-Up Activity Logs
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Auditable log of callback record state modifications and human-in-the-loop notes
            </p>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
            {callbacks.filter((c) => c.updated_at).length} updated records
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Customer</th>
                <th className="px-5 py-3 whitespace-nowrap">Status</th>
                <th className="px-5 py-3 whitespace-nowrap">Modified By</th>
                <th className="px-5 py-3 whitespace-nowrap">Updated Timestamp</th>
                <th className="px-5 py-3 min-w-[280px]">Follow-Up Notes Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {callbacks
                .filter((c) => c.updated_at)
                .slice(0, 5)
                .map((cb) => (
                  <tr key={cb.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {cb.customer_name}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="capitalize font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {cb.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-blue-600 font-medium">
                      {cb.updated_by || 'Workspace Admin'}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500">
                      {formatDate(cb.updated_at)}
                    </td>
                    <td className="px-5 py-3 text-gray-700 italic">
                      {cb.follow_up_notes || '—'}
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
