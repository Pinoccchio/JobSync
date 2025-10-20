'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-[#22A555] to-[#1A7F3E] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">JS</span>
            </div>
            <div>
              <div className="font-bold text-2xl text-gray-900">JobSync</div>
              <div className="text-xs text-gray-600">Municipality of Asuncion</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-[#22A555] transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-[#22A555] transition-colors font-medium">
              How It Works
            </a>
            <a href="#about" className="text-gray-700 hover:text-[#22A555] transition-colors font-medium">
              About
            </a>
            <Link href="/login" className="text-gray-700 hover:text-[#22A555] transition-colors font-medium">
              Admin Portal
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center">
            <Link href="/register">
              <Button variant="success" size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
