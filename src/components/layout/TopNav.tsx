'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { Bell, Settings, LogOut, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  time: string;
}

interface TopNavProps {
  userRole?: string;
  userName?: string;
  pageTitle?: string;
  pageDescription?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  userRole = 'User',
  userName = 'User',
  pageTitle,
  pageDescription
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications: Notification[] = [
    {
      id: 1,
      message: 'Your application for IT Assistant has been approved',
      type: 'success',
      time: '5 min ago'
    },
    {
      id: 2,
      message: 'Application for HR Officer was disapproved',
      type: 'error',
      time: '1 hour ago'
    },
    {
      id: 3,
      message: 'New training program available: Web Development',
      type: 'info',
      time: '2 hours ago'
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="bg-white h-16 flex items-center justify-between px-6 shadow-sm border-b border-gray-200">
      {/* Page Title */}
      <div className="flex-1">
        {pageTitle && (
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
            {pageDescription && (
              <p className="text-sm text-gray-600">{pageDescription}</p>
            )}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <span className="text-xs text-gray-500">{unreadCount} new</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-[#22A555] hover:text-[#1A7F3E] font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300"></div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#22A555] to-[#1A7F3E] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-600">{userRole}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-14 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-600">{userRole}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      showToast('Settings feature coming soon', 'info');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
