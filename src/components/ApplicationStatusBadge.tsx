import React from 'react';
import { CheckCircle, Clock, XCircle, Eye, Star, Calendar, Briefcase, Archive, AlertCircle } from 'lucide-react';

interface ApplicationStatusBadgeProps {
  status: 'pending' | 'under_review' | 'shortlisted' | 'interviewed' | 'approved' | 'denied' | 'hired' | 'archived' | 'withdrawn';
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
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending Review',
        };
      case 'under_review':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Eye,
          label: 'Under Review',
        };
      case 'shortlisted':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Star,
          label: 'Shortlisted',
        };
      case 'interviewed':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Calendar,
          label: 'Interviewed',
        };
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
          label: 'Not Approved',
        };
      case 'hired':
        return {
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          icon: Briefcase,
          label: 'Hired',
        };
      case 'archived':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Archive,
          label: 'Archived',
        };
      case 'withdrawn':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          label: 'Withdrawn',
        };
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
