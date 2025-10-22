'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Demo validation
      if (!formData.email || !formData.password) {
        showToast('Please fill in all fields', 'error');
        setIsLoading(false);
        return;
      }

      await login(formData.email, formData.password, formData.role);
      showToast('Login successful!', 'success');

      // Redirect based on selected role
      switch (formData.role) {
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'HR':
          router.push('/hr/dashboard');
          break;
        case 'PESO':
          router.push('/peso/dashboard');
          break;
        case 'APPLICANT':
          router.push('/applicant/dashboard');
          break;
      }
    } catch (error) {
      showToast('Invalid credentials', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative py-12"
      style={{
        backgroundImage: 'url(/municipal.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Green Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#22A555]/90 to-[#1A7F3E]/90"></div>

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-5xl mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Section - Logo & Info */}
          <div className="flex flex-col items-center justify-center text-center">
            <Image
              src="/logo-no-bg.png"
              alt="Municipality of Asuncion Logo"
              width={280}
              height={280}
              className="rounded-full mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">JobSync</h1>
            <p className="text-gray-600 text-sm">
              Municipality of Asuncion<br />
              Davao del Norte
            </p>
          </div>

          {/* Right Section - Login Form */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Login to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login As
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#22A555] transition-colors bg-white"
                  disabled={isLoading}
                >
                  <option value="ADMIN">System Admin</option>
                  <option value="HR">HR Admin</option>
                  <option value="PESO">PESO Admin</option>
                  <option value="APPLICANT">Applicant</option>
                </select>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 text-[#22A555] border-gray-300 rounded focus:ring-[#22A555]"
                    disabled={isLoading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#22A555] hover:text-[#1A7F3E] font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-[#22A555] to-[#1A7F3E] hover:from-[#1A7F3E] hover:to-[#22A555]"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-[#22A555] hover:text-[#1A7F3E] font-semibold"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-[#D4F4DD] rounded-xl">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">Demo Mode:</span> You can login with any email and password
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
