import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface ApplicationStatusBadgeProps {
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  matchScore?: number | null;
  className?: string;
  showDate?: boolean;
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status,
  createdAt,
  matchScore,
  className = '',
  showDate = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Approved',
        };
      case 'denied':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Denied',
        };
      case 'pending':
      default:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${config.color} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{config.label}</span>
      {showDate && (
        <span className="text-xs opacity-75">• {formatDate(createdAt)}</span>
      )}
      {matchScore && (
        <span className="text-xs font-semibold ml-1">({matchScore}%)</span>
      )}
    </div>
  );
};

// Simple "Applied" badge for job cards
interface AppliedBadgeProps {
  createdAt: string;
  className?: string;
}

export const AppliedBadge: React.FC<AppliedBadgeProps> = ({ createdAt, className = '' }) => {
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500 text-white shadow-sm ${className}`}
      title={`Applied on ${new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`}
    >
      <CheckCircle className="w-3 h-3" />
      <span className="text-xs font-medium">Applied {formatRelativeDate(createdAt)}</span>
    </div>
  );
};
