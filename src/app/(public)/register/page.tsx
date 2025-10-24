'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { signupUser } from '@/lib/supabase/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'APPLICANT' as 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateFullName = (name: string) => {
    if (!name) return 'Full name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      terms: formData.agreeToTerms ? '' : 'You must agree to the terms and conditions',
    };

    setErrors(newErrors);

    // If any errors exist, stop submission
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Creating user account...');
      console.log('📋 Registration details:', {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role
      });

      // Use auth.ts signupUser function
      const result = await signupUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log('✅ User created successfully:', {
        userId: result.data.userId,
        profileId: result.data.profileId,
        emailConfirmationSent: result.data.emailConfirmationSent
      });

      // Always redirect to login page after signup
      // User must log in separately (following INCLOUD pattern)
      console.log('➡️ Redirecting to /login');

      const successMessage = result.data.emailConfirmationSent
        ? 'Account created! Please check your email to verify your account.'
        : `Account created successfully as ${formData.role}! Please login to continue.`;

      showToast(successMessage, 'success');
      router.push('/login');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name
      });

      // Handle specific server error messages (keep toast for these)
      if (error.message?.includes('User already registered')) {
        console.warn('⚠️ User already exists');
        showToast('This email is already registered. Please login instead.', 'error');
      } else {
        // Show server errors in toast
        showToast(error.message || 'Registration failed. Please try again.', 'error');
      }

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

      {/* Register Card */}
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
            <p className="text-gray-600 text-sm mb-6">
              Municipality of Asuncion<br />
              Davao del Norte
            </p>
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#22A555] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">AI-powered job matching</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#22A555] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Instant PDS processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#22A555] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Real-time notifications</span>
              </div>
            </div>
          </div>

          {/* Right Section - Register Form */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">
                Join JobSync to find your perfect job match
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  onBlur={(e) => setErrors({ ...errors, fullName: validateFullName(e.target.value) })}
                  error={errors.fullName}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  onBlur={(e) => setErrors({ ...errors, email: validateEmail(e.target.value) })}
                  error={errors.email}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Register As
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#22A555] transition-colors bg-white text-gray-900"
                  disabled={isLoading}
                  required
                >
                  <option value="APPLICANT">Applicant (Job Seeker)</option>
                  <option value="HR">HR Admin (Municipal Hall)</option>
                  <option value="PESO">PESO Admin (Training Programs)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select your role. Admins have full access to the system.
                </p>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  onBlur={(e) => setErrors({ ...errors, password: validatePassword(e.target.value) })}
                  error={errors.password}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  onBlur={(e) => setErrors({ ...errors, confirmPassword: validateConfirmPassword(formData.password, e.target.value) })}
                  error={errors.confirmPassword}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Terms Agreement */}
              <div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => {
                      setFormData({ ...formData, agreeToTerms: e.target.checked });
                      if (errors.terms) setErrors({ ...errors, terms: '' });
                    }}
                    className="w-4 h-4 mt-1 text-[#22A555] border-gray-300 rounded focus:ring-[#22A555]"
                    disabled={isLoading}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[#22A555] hover:text-[#1A7F3E] font-medium">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#22A555] hover:text-[#1A7F3E] font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
                )}
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-[#22A555] to-[#1A7F3E] hover:from-[#1A7F3E] hover:to-[#22A555]"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-[#22A555] hover:text-[#1A7F3E] font-semibold"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
