"use client";

import { useState } from 'react';
import { KeyRound, ShieldAlert, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSetup() {
  const [formData, setFormData] = useState({ masterKey: '', username: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Check if response is okay before parsing JSON
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Server Error (${res.status}): ${errorBody.substring(0, 50)}...`);
      }

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      console.error("Setup Request Error:", err);
      setMessage({ type: 'error', text: err.message || "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-900/30 rounded-2xl mb-4">
            <ShieldAlert className="text-blue-500" size={32} />
          </div>
          <h1 className="text-xl font-bold">Master Admin Setup</h1>
          <p className="text-slate-500 text-xs mt-1">Recovery & Emergency Registration Panel</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-3 rounded-lg text-xs font-medium text-center border ${
            message.type === 'success' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-red-950/30 border-red-500/50 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSetup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Master Recovery Key</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 text-slate-600" size={16} />
              <input type="password" required className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all" 
                placeholder="Enter key from .env file" value={formData.masterKey} onChange={(e) => setFormData({...formData, masterKey: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Admin Name</label>
              <input type="text" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500" 
                placeholder="System Admin" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Admin Username</label>
              <input type="text" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 lowercase" 
                placeholder="admin_id" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">New Password</label>
              <input type="password" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500" 
                placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-900/20">
            {loading ? "Verifying..." : <><UserCheck size={16} /> Update Admin Account</>}
          </button>
        </form>
      </div>
    </div>
  );
}