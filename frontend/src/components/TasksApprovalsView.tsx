import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  PhoneCall,
  CheckCircle2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  type CallbackRequest,
  type CallbackStats,
} from '../services/api';
import { CallbackStatusBadge } from './CallbackStatusBadge';

interface TasksApprovalsViewProps {
  callbacks: CallbackRequest[];
  stats: CallbackStats;
  loading: boolean;
  onRefresh: () => void;
  onSelectCallback: (cb: CallbackRequest) => void;
}

export const TasksApprovalsView: React.FC<TasksApprovalsViewProps> = ({
  callbacks,
  stats,
  loading,
  onRefresh,
  onSelectCallback,
}) => {
  const [taskTab, setTaskTab] = useState<'pending' | 'in_progress' | 'audit'>('pending');

  const pendingTasks = callbacks.filter((c) => c.status === 'pending_review');
  const inProgressTasks = callbacks.filter((c) => c.status === 'contacted');
  const auditTasks = callbacks.filter((c) => c.status === 'completed' || c.status === 'cancelled');

  const activeList =
    taskTab === 'pending'
      ? pendingTasks
      : taskTab === 'in_progress'
      ? inProgressTasks
      : auditTasks;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
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
            HUMAN SUPERVISION QUEUE
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
            Tasks & Human-in-the-Loop Approvals
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Centralized queue where administrators review customer callback requests, approve actions, and maintain relationship logs.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Pending Approvals</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-3">
            {stats.pending_review}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Awaiting administrator contact
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">In Progress Follow-ups</span>
            <PhoneCall size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-3">
            {stats.contacted}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Customer contacted; awaiting conclusion
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Completed Follow-ups</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-3">
            {stats.completed}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Successfully closed customer inquiries
          </p>
        </div>
      </div>

      {/* TASK QUEUE TABS */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            {[
              { id: 'pending', label: 'Pending Review', count: pendingTasks.length },
              { id: 'in_progress', label: 'In Follow-up', count: inProgressTasks.length },
              { id: 'audit', label: 'Completed History', count: auditTasks.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTaskTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  taskTab === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500">
            {activeList.length} task{activeList.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* TASK LIST TABLE */}
        {loading ? (
          <div className="py-16 text-center text-gray-500 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
            Loading task queue...
          </div>
        ) : activeList.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            <CheckSquare size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="font-medium text-gray-600">No tasks in this queue</p>
            <p className="text-gray-400 mt-1">All follow-ups in this stage have been addressed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 whitespace-nowrap min-w-[170px]">Customer</th>
                  <th className="px-5 py-3 whitespace-nowrap min-w-[140px]">Phone Number</th>
                  <th className="px-5 py-3 whitespace-nowrap min-w-[150px]">Preferred Time</th>
                  <th className="px-5 py-3 min-w-[240px] max-w-[340px]">Customer Requirement</th>
                  <th className="px-5 py-3 whitespace-nowrap min-w-[140px]">Status</th>
                  <th className="px-5 py-3 whitespace-nowrap min-w-[160px]">Last Updated</th>
                  <th className="px-5 py-3 whitespace-nowrap min-w-[120px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {activeList.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onSelectCallback(task)}
                    className="hover:bg-blue-50/30 transition cursor-pointer"
                  >
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-900">
                      {task.customer_name}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">{task.phone_number}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">{task.preferred_time}</td>
                    <td className="px-5 py-4">
                      <p className="max-w-[300px] truncate text-gray-600" title={task.reason || ''}>
                        {task.reason || 'Voice callback'}
                      </p>
                      {task.follow_up_notes && (
                        <p className="text-[11px] text-blue-600 italic mt-0.5 max-w-[300px] truncate">
                          Notes: {task.follow_up_notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <CallbackStatusBadge status={task.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                      {formatDate(task.updated_at || task.created_at)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCallback(task);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs whitespace-nowrap shrink-0"
                      >
                        <Eye size={13} />
                        <span>Review & Act</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
