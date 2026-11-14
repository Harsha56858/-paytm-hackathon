import React from 'react';
import { Clock, PhoneCall, CheckCircle2, XCircle } from 'lucide-react';
import type { CallbackStatus } from '../services/api';

interface CallbackStatusBadgeProps {
  status: CallbackStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const CallbackStatusBadge: React.FC<CallbackStatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case 'pending_review':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 ${className}`}
        >
          {showIcon && <Clock size={12} className="shrink-0" />}
          <span>Pending Review</span>
        </span>
      );

    case 'contacted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 ${className}`}
        >
          {showIcon && <PhoneCall size={12} className="shrink-0" />}
          <span>Contacted</span>
        </span>
      );

    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 ${className}`}
        >
          {showIcon && <CheckCircle2 size={12} className="shrink-0" />}
          <span>Completed</span>
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500 border border-gray-500/20 ${className}`}
        >
          {showIcon && <XCircle size={12} className="shrink-0" />}
          <span>Cancelled</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20 capitalize ${className}`}
        >
          {status.replace(/_/g, ' ')}
        </span>
      );
  }
};
