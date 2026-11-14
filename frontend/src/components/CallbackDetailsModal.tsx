import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Calendar,
  Clock,
  User,
  MessageSquare,
  FileText,
  CheckCircle2,
  PhoneCall,
  XCircle,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  type CallbackRequest,
  type CallbackStatus,
  callbackRequestService,
} from '../services/api';
import { CallbackStatusBadge } from './CallbackStatusBadge';

interface CallbackDetailsModalProps {
  callback: CallbackRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedCallback: CallbackRequest) => void;
}

const NOTE_SNIPPETS = [
  'Customer contacted; requested product demonstration.',
  'Shared pricing breakdown and architecture details.',
  'Customer was busy; requested callback tomorrow.',
  'Number unreachable; sent follow-up SMS and email.',
  'Customer cancelled request; needs postponed to next quarter.',
];

export const CallbackDetailsModal: React.FC<CallbackDetailsModalProps> = ({
  callback,
  isOpen,
  onClose,
  onUpdated,
}) => {
  // Always declare hooks unconditionally at the top level
  const [selectedStatus, setSelectedStatus] = useState<CallbackStatus | string>(
    callback?.status || 'pending_review'
  );
  const [notes, setNotes] = useState<string>(callback?.follow_up_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Synchronize state when selected callback changes
  useEffect(() => {
    if (callback) {
      setSelectedStatus(callback.status);
      setNotes(callback.follow_up_notes || '');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [callback?.id, callback?.status, callback?.follow_up_notes]);

  if (!isOpen || !callback) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
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

  const handleUpdate = async (newStatus?: CallbackStatus) => {
    const targetStatus = newStatus || selectedStatus;
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload: {
        status?: string;
        follow_up_notes?: string;
      } = {};

      if (targetStatus !== callback.status) {
        payload.status = targetStatus;
      }

      const trimmedNotes = notes.trim();
      if (trimmedNotes !== (callback.follow_up_notes || '')) {
        payload.follow_up_notes = trimmedNotes;
      }

      // If nothing changed, notify user
      if (!payload.status && payload.follow_up_notes === undefined) {
        setErrorMessage('No changes to save.');
        setIsSaving(false);
        return;
      }

      const res = await callbackRequestService.update(callback.id, payload);

      if (res.success && res.callback) {
        setSuccessMessage('Callback request updated successfully.');
        setSelectedStatus(res.callback.status);
        setNotes(res.callback.follow_up_notes || '');
        onUpdated(res.callback);

        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Failed to update callback request:', err);
      const detail =
        err?.response?.data?.detail ||
        'Unable to update callback request. Please verify connection and administrator permissions.';
      setErrorMessage(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setIsSaving(false);
    }
  };

  const applySnippet = (snippet: string) => {
    setNotes((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n• ${snippet}` : `• ${snippet}`;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {callback.customer_name}
                </h3>
                <CallbackStatusBadge status={callback.status} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Callback ID: <code className="text-gray-600 bg-gray-100 px-1 py-0.5 rounded">{callback.id}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* CUSTOMER INFORMATION GRID */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 space-y-3">
            <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Customer Information
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  Phone Number
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {callback.phone_number}
                  </span>
                  <a
                    href={`tel:${callback.phone_number}`}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition"
                  >
                    <PhoneCall size={11} />
                    Call
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  Preferred Time
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {callback.preferred_time || 'Not specified'}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-gray-400" />
                  Reason for Callback
                </p>
                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200/80 mt-1">
                  {callback.reason || 'Requested during voice interaction.'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  Created Timestamp
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  {formatDate(callback.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-gray-400" />
                  Last Updated
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  {callback.updated_at
                    ? `${formatDate(callback.updated_at)} by ${callback.updated_by || 'Admin'}`
                    : 'Awaiting human review'}
                </p>
              </div>
            </div>
          </div>

          {/* ADMINISTRATOR ACTION BUTTONS */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase flex items-center justify-between">
              <span>Quick Status Actions</span>
              <span className="text-[10px] text-gray-400 font-normal">
                Human-in-the-Loop Supervision
              </span>
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('contacted');
                  handleUpdate('contacted');
                }}
                disabled={isSaving}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition ${
                  selectedStatus === 'contacted'
                    ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <PhoneCall size={16} className="text-blue-600" />
                <span>Mark Contacted</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('completed');
                  handleUpdate('completed');
                }}
                disabled={isSaving}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition ${
                  selectedStatus === 'completed'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Mark Completed</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('cancelled');
                  handleUpdate('cancelled');
                }}
                disabled={isSaving}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition ${
                  selectedStatus === 'cancelled'
                    ? 'bg-gray-100 border-gray-400 text-gray-800 ring-2 ring-gray-400/20 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <XCircle size={16} className="text-gray-500" />
                <span>Cancel Request</span>
              </button>
            </div>

            {selectedStatus !== 'pending_review' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('pending_review');
                  handleUpdate('pending_review');
                }}
                disabled={isSaving}
                className="text-[11px] text-gray-500 hover:text-gray-700 underline flex items-center gap-1 mt-1"
              >
                <RotateCcw size={11} />
                Revert to Pending Review
              </button>
            )}
          </div>

          {/* FOLLOW-UP NOTES EDITOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="follow_up_notes"
                className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase flex items-center gap-1.5"
              >
                <FileText size={13} className="text-gray-400" />
                Internal Follow-Up Notes
              </label>

              <span className="text-[11px] text-gray-400">
                {notes.length}/5000 characters
              </span>
            </div>

            <textarea
              id="follow_up_notes"
              rows={4}
              maxLength={5000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record details of conversation, customer requirements, demo schedules, or cancellation reasons..."
              className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition resize-none placeholder:text-gray-400"
            />

            {/* QUICK NOTE SNIPPETS */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" />
                Quick insert notes:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {NOTE_SNIPPETS.map((snippet, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySnippet(snippet)}
                    className="text-[11px] bg-gray-100 hover:bg-gray-200/80 text-gray-600 px-2.5 py-1 rounded-md transition text-left"
                  >
                    + {snippet.slice(0, 38)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Current status: <strong className="text-gray-700 capitalize">{selectedStatus.replace(/_/g, ' ')}</strong>
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => handleUpdate()}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save Notes & Status'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
