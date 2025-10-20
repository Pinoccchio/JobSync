'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  label: string;
  href: string;
  icon?: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  role: 'HR' | 'PESO' | 'Applicant';
}

export const Sidebar: React.FC<SidebarProps> = ({ menuItems, role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={`bg-[#1A7F3E] text-white h-screen fixed left-0 top-0 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } flex flex-col`}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
          <span className="text-[#1A7F3E] font-bold text-sm">JS</span>
        </div>
        {!isCollapsed && <span className="font-bold text-xl">JOBSYNC</span>}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive ? 'bg-[#22A555]' : 'hover:bg-[#22A555]'
              }`}
            >
              {item.icon && <span>{item.icon}</span>}
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 hover:bg-[#22A555] transition-colors"
      >
        <span>{isCollapsed ? '→' : '←'}</span>
      </button>
    </div>
  );
};
