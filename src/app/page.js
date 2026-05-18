"use client";

import { useState } from 'react';
import { ArrowRight, Activity, AlertTriangle } from 'lucide-react';
import PrintableSlip from '@/components/PrintableSlip';

export default function Home() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [mobile, setMobile] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, name, age, gender, mobile })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Frontend Fetch Error:", error);
      alert("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-3xl font-bold mb-2">
          <Activity className="animate-pulse" size={36} />
          <h1>ArogyaQueue</h1>
        </div>
<p className="text-slate-400 text-sm">I.G.M. Hospital, Bhiwandi — Online OPD Token Desk</p>      </div>

      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">Patient Details</h2>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 uppercase"
                placeholder="Enter full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Age</label>
                <input 
                  type="number" required value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Gender</label>
                <select 
                  value={gender} onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Mobile Number</label>
              <input 
                type="tel" required pattern="[0-9]{10}" maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                placeholder="Enter 10-digit phone number"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Describe Symptoms</label>
              <textarea 
                required rows="3" value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                maxLength={250}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                placeholder="What is the medical issue?"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-700"
            >
              {loading ? "AI Processing..." : <>Generate Token ID <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            {result.is_emergency ? (
              <div className="bg-red-950/50 border border-red-500 rounded-xl p-5 text-left space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-lg">
                  <AlertTriangle size={24} />
                  <span>EMERGENCY ALERT</span>
                </div>
                <p className="text-sm text-red-200 leading-relaxed">{result.message}</p>
                <div className="text-2xl font-black text-center text-red-400 bg-red-900/40 py-2 rounded-lg tracking-wider border border-red-500/30">
                  {result.unique_token_id}
                </div>
              </div>
            ) : (
              /* LIVE REUSABLE COMPONENT IMPORT */
              <PrintableSlip 
                result={result} 
                name={name} 
                age={age} 
                gender={gender} 
                mobile={mobile} 
              />
            )}

            <button 
              onClick={() => { setResult(null); setSymptoms(''); }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 rounded-lg text-sm transition-all"
            >
              Book Another Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}