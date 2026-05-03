'use client';

import React from 'react';
import { ChevronRight, Phone, MessageSquare, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Respondfall</div>
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="text-slate-300 hover:text-white transition text-sm">Dashboard</a>
            <a
              href="/signup"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition text-sm flex items-center space-x-1"
            >
              <span>Start Free Trial</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-block bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1 text-green-400 text-sm font-medium mb-6">
          Revenue Recovery Network for Local Service Businesses
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
          Stop Losing Revenue<br />to Missed Calls
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          Respondfall captures the 35–40% of inbound calls your business misses every day and converts that lost revenue into automated recovery sequences.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/signup"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-lg transition text-lg flex items-center space-x-2"
          >
            <span>Start Your Free Trial</span>
            <ChevronRight className="w-5 h-5" />
          </a>
          <a
            href="/dashboard"
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-10 rounded-lg transition text-lg"
          >
            View Demo Dashboard
          </a>
        </div>
        <p className="text-slate-500 text-sm mt-4">15-day free trial · No credit card required</p>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <p className="text-5xl font-extrabold text-green-400 mb-2">35–40%</p>
            <p className="text-slate-300 font-medium">of inbound calls go unanswered</p>
            <p className="text-slate-500 text-sm mt-2">That's revenue walking out the door every single day.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <p className="text-5xl font-extrabold text-blue-400 mb-2">4 min</p>
            <p className="text-slate-300 font-medium">to get fully set up</p>
            <p className="text-slate-500 text-sm mt-2">Self-serve onboarding with automatic number provisioning.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <p className="text-5xl font-extrabold text-purple-400 mb-2">70%</p>
            <p className="text-slate-300 font-medium">average SMS response rate</p>
            <p className="text-slate-500 text-sm mt-2">AI-qualified leads routed directly to your team.</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 flex items-start space-x-5">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Missed Call Recovery</h3>
              <p className="text-slate-400">Every missed call triggers an automated SMS recovery sequence. No lead slips through the cracks.</p>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 flex items-start space-x-5">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">AI Lead Qualification</h3>
              <p className="text-slate-400">Intelligent SMS sequences qualify leads automatically and route hot prospects directly to your sales team.</p>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 flex items-start space-x-5">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Revenue Analytics</h3>
              <p className="text-slate-400">See exactly how much revenue you've protected. One number that makes the ROI undeniable.</p>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 flex items-start space-x-5">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Automatic Number Provisioning</h3>
              <p className="text-slate-400">A local number is provisioned for your business instantly via Twilio. Forwarding is set up automatically.</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Start free for 15 days. No credit card required. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
            <p className="text-slate-400 text-sm font-medium uppercase mb-2">Starter</p>
            <p className="text-4xl font-extrabold text-white mb-1">$97<span className="text-lg font-normal text-slate-400">/mo</span></p>
            <p className="text-slate-500 text-sm mb-6">Missed call SMS + recovery sequences</p>
            <a href="/signup?tier=starter" className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition">
              Get Started
            </a>
          </div>
          <div className="bg-slate-800/50 border border-green-500/50 rounded-lg p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
            <p className="text-slate-400 text-sm font-medium uppercase mb-2">Pro</p>
            <p className="text-4xl font-extrabold text-white mb-1">$197<span className="text-lg font-normal text-slate-400">/mo</span></p>
            <p className="text-slate-500 text-sm mb-6">+ AI qualification + review automation</p>
            <a href="/signup?tier=pro" className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition">
              Get Started
            </a>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
            <p className="text-slate-400 text-sm font-medium uppercase mb-2">Agency</p>
            <p className="text-4xl font-extrabold text-white mb-1">$397<span className="text-lg font-normal text-slate-400">/mo</span></p>
            <p className="text-slate-500 text-sm mb-6">+ referral automation + full analytics</p>
            <a href="/signup?tier=agency" className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition">
              Get Started
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/50 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Protect Your Revenue?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">Join thousands of local service businesses that never miss a lead. Set up in 4 minutes. Free for 15 days.</p>
          <a
            href="/signup"
            className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-lg transition text-lg"
          >
            <span>Start Your Free Trial</span>
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
