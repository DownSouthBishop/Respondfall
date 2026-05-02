import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Phone, MessageSquare, TrendingUp, Clock, Settings, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [customer, setCustomer] = useState({
    businessName: 'Miami HVAC Solutions',
    respondNumber: '+1 (305) 555-0123',
    tier: 'pro',
    trialEndsAt: '2026-05-17',
    daysRemaining: 15,
  });

  const [stats, setStats] = useState({
    totalCallsCaptured: 127,
    missedCallsRecovered: 89,
    smsSequencesSent: 312,
    revenueProtected: 14100,
    conversionRate: 0.70,
  });

  const [dailyData] = useState([
    { day: 'May 2', calls: 12, revenue: 840 },
    { day: 'May 3', calls: 15, revenue: 1050 },
    { day: 'May 4', calls: 18, revenue: 1260 },
    { day: 'May 5', calls: 22, revenue: 1540 },
    { day: 'May 6', calls: 25, revenue: 1750 },
    { day: 'May 7', calls: 28, revenue: 1960 },
    { day: 'Today', calls: 31, revenue: 2170 },
  ]);

  const [recentCalls, setRecentCalls] = useState([
    { id: 1, time: '2:45 PM', caller: 'John D.', status: 'Qualified Lead', action: 'SMS sent, Awaiting response' },
    { id: 2, time: '1:23 PM', caller: 'Sarah M.', status: 'Hot Lead', action: 'Routed to sales team' },
    { id: 3, time: '12:15 PM', caller: 'Mike R.', status: 'Qualified Lead', action: 'SMS sent, Awaiting response' },
    { id: 4, time: '11:42 AM', caller: 'Lisa T.', status: 'Converted', action: 'Booked appointment' },
    { id: 5, time: '10:30 AM', caller: 'James K.', status: 'Qualified Lead', action: 'SMS sent, Awaiting response' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Respondfall</div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-white font-medium">{customer.businessName}</p>
              <p className="text-sm text-slate-400">{customer.respondNumber}</p>
            </div>
            <button className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Settings className="w-5 h-5 text-slate-300" />
            </button>
            <button className="p-2 hover:bg-slate-700 rounded-lg transition">
              <LogOut className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-8">
          <p className="text-blue-200">
            <strong>Free trial active:</strong> {customer.daysRemaining} days remaining. Billing starts {customer.trialEndsAt}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-medium">REVENUE PROTECTED</p>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-2">${stats.revenueProtected.toLocaleString()}</p>
            <p className="text-xs text-slate-500">This is real money you would have lost to missed calls.</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-medium">CALLS CAPTURED</p>
              <Phone className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-2">{stats.totalCallsCaptured}</p>
            <p className="text-xs text-slate-500">{stats.missedCallsRecovered} qualified and recovered</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-medium">SMS SEQUENCES</p>
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-2">{stats.smsSequencesSent}</p>
            <p className="text-xs text-slate-500">{(stats.conversionRate * 100).toFixed(1)}% response rate</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-medium">TRIAL STATUS</p>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-2">{customer.daysRemaining}</p>
            <p className="text-xs text-slate-500">Days remaining in free trial</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-6">Revenue Protected (7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-6">Calls Captured (7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="calls" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent Recovered Calls (Today)</h3>
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-start justify-between border-b border-slate-700 pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="font-medium text-white">{call.caller}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        call.status === 'Converted'
                          ? 'bg-green-500/20 text-green-300'
                          : call.status === 'Hot Lead'
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {call.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{call.action}</p>
                </div>
                <p className="text-sm text-slate-500">{call.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to Upgrade?</h3>
          <p className="text-slate-300 mb-6">Unlock advanced features like AI lead qualification, review automation, and more.</p>
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition">
            View All Plans
          </button>
        </div>

      </div>
    </div>
  );
}
