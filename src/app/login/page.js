"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldCheck } from 'lucide-react';

export default function UnifiedLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        // Safe keeping user state inside localStorage for client checks
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);
        if (data.user.department) localStorage.setItem('userDept', data.user.department);

        // 🚀 ROLE BASED REDIRECTION FACTORY
        if (data.user.role === 'Admin') {
          router.push('/admin');
        } else if (data.user.role === 'Doctor') {
          router.push('/doctor');
        } else if (data.user.role === 'Receptionist') {
          router.push('/reception');
        }
      } else {
        setError(data.error || "Login Failed");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 text-blue-500 text-3xl font-bold mb-1">
          <ShieldCheck size={36} />
          <h1>I.G.M. Portal Login</h1>
        </div>
        <p className="text-slate-400 text-xs">Official Staff Authentication Gateway — Bhiwandi</p>
      </div>

      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm">
          <h2 className="text-md font-semibold text-slate-300 border-b border-slate-700 pb-2 text-center">Staff Verification</h2>
          
          {error && (
            <div className="bg-red-950/40 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-xs text-center font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Username / ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User size={14} />
                </span>
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 lowercase"
                  placeholder="Enter your official username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={14} />
                </span>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-all text-xs mt-2"
          >
            {loading ? "Verifying Credentials..." : "Access Secure Terminal"}
          </button>
        </form>
      </div>
    </div>
  );
}