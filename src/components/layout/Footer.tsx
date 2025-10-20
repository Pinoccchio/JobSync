import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#22A555] to-[#1A7F3E] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">JS</span>
              </div>
              <h3 className="font-bold text-lg">JobSync</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Gemini AI-powered job matching system for the Municipality of Asuncion, Davao del Norte
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Training Programs
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">
                Municipality of Asuncion
              </li>
              <li className="text-gray-400">
                Davao del Norte
              </li>
              <li className="text-gray-400">
                Philippines
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} JobSync. Municipality of Asuncion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
