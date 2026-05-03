'use client';

import React, { useState } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessPhone: '',
    ownerEmail: '',
    tier: 'pro',
    password: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleStepOne = () => {
    if (!formData.businessName || !formData.businessPhone || !formData.ownerEmail) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStepTwo = () => {
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must agree to terms and conditions');
      return;
    }
    setError('');
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStep(3);
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="text-2xl font-bold text-white">Respondfall</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-green-400' : 'bg-slate-700'}`}></div>
          <div className="px-4 text-center text-slate-400">Step {step} of 3</div>
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-green-400' : 'bg-slate-700'}`}></div>
          <div className="px-4 text-center text-slate-400">4 min setup</div>
          <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-green-400' : 'bg-slate-700'}`}></div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-8 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Business Information</h2>
            <p className="text-slate-400 mb-6">We'll use this to set up your account.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g., Miami HVAC Solutions"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Business Phone</label>
                <input
                  type="tel"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-400"
                />
                <p className="text-xs text-slate-500 mt-2">We'll create a new number that forwards to this one.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Email</label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  placeholder="you@business.com"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Choose Your Plan</label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
                >
                  <option value="starter">Starter - $97/month</option>
                  <option value="pro">Pro - $197/month (Recommended)</option>
                  <option value="agency">Agency - $397/month</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStepOne}
              className="w-full mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition"
            >
              <span>Continue</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Secure Your Account</h2>
            <p className="text-slate-400 mb-6">Create a password and agree to our terms.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min. 8 characters"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-400"
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <label className="text-sm text-slate-300">
                  I agree to Respondfall's Terms of Service and Privacy Policy
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handleStepTwo}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-slate-500 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-slate-800/50 border border-green-400/50 rounded-lg p-8 text-center mb-8">
            <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-slate-300 mb-4">Your Respondfall account is ready. We're provisioning your phone number now.</p>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-slate-400 mb-2">What happens next:</p>
              <ol className="text-sm text-slate-300 space-y-2">
                <li>✓ New local number created and forwarding set up</li>
                <li>✓ SMS sequences activated</li>
                <li>✓ Dashboard ready to view incoming calls</li>
                <li>✓ 15-day free trial starts now</li>
              </ol>
            </div>

            <p className="text-slate-400 text-sm mb-6">You'll receive an email confirmation and your dashboard login within 1 minute.</p>

            <a
              href="/dashboard"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Go to Dashboard
            </a>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
          <p className="text-blue-200 text-sm">
            <strong>Free trial includes:</strong> Full access to your plan, local number provisioning, SMS sequences, and analytics. No credit card charged until day 15.
          </p>
        </div>
      </div>
    </div>
  );
}
