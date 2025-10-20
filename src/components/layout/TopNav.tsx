'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface TopNavProps {
  userRole?: string;
  userName?: string;
  showSearch?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  userRole = 'User',
  userName = 'User',
  showSearch = true
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, message: 'Application Status: disapproved', type: 'error' },
    { id: 2, message: 'New applicant submitted PDS', type: 'info' },
  ];

  return (
    <div className="bg-[#D4F4DD] h-16 flex items-center justify-between px-6 shadow-sm">
      {/* Search Bar */}
      {showSearch && (
        <div className="flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search for..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#22A555]"
          />
        </div>
      )}

      {!showSearch && <div></div>}

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-[#22A555] hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <span className="text-2xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-sm text-gray-700">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-[#22A555] hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 bg-[#22A555] rounded-full flex items-center justify-center text-white font-semibold">
              {userName.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700">{userRole}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <button
                onClick={() => showToast('Settings feature coming soon', 'info')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                Settings
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 border-t border-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
