"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, RefreshCw, LogOut } from 'lucide-react';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorDept, setDoctorDept] = useState('General Medicine');
  const [doctorName, setDoctorName] = useState('On Duty Consultant');
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/doctor');
      const resData = await response.json();
      if (resData.success) {
        setPatients(resData.data);
      }
    } catch (error) {
      console.error("Error fetching doctor queue:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (tokenId, nextStatus) => {
    try {
      const response = await fetch('/api/doctor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: tokenId, new_status: nextStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchQueue();
      }
    } catch (error) {
      console.error(error);
    }
  }, [fetchQueue]);

  // 🛡️ SECURITY & SESSION PARSING
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const dept = localStorage.getItem('userDept');

    if (role === 'Doctor' || role === 'Admin') {
      Promise.resolve().then(() => {
        setAuthorized(true);
        if (name) setDoctorName(name);
        if (dept) setDoctorDept(dept);
        fetchQueue();
      });
    } else {
      router.push('/login');
    }

    // Auto-refresh queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue, router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // 🔥 INTELLIGENT FILTERING: Sirf is logged-in doctor ke dept ke mareez dikhana
  const filteredPatients = patients.filter(p => p.assigned_department === doctorDept);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-sm font-mono animate-pulse text-slate-400">Verifying Clinic Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Upper Bar */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Users className="text-emerald-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{doctorName} Center</h1>
            <p className="text-xs text-slate-400">I.G.M. Hospital — Active Cabin Wards for <strong className="text-emerald-400">{doctorDept}</strong></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchQueue}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-lg text-slate-400 hover:text-emerald-400 transition-all"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CURRENTLY SERVING BOX */}
      <div className="md:col-span-1 bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-80">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Now Serving Patient</h2>
            {filteredPatients.length > 0 ? (
              <div className="space-y-3">
                <div className="text-4xl font-black text-emerald-400 tracking-widest bg-slate-900/60 text-center py-4 rounded-xl border border-emerald-500/20">
                  {filteredPatients[0].unique_token_id}
                </div>
                <div className="text-sm space-y-1 text-slate-300 bg-slate-900/20 p-3 rounded-lg border border-slate-700/50">
                  <p><strong className="text-slate-500">Name:</strong> {filteredPatients[0].name}</p>
                  <p><strong className="text-slate-500">Age/Sex:</strong> {filteredPatients[0].age} Y / {filteredPatients[0].gender}</p>
                  <p><strong className="text-slate-500">Symptoms:</strong> <span className="text-slate-400 italic">&quot;{filteredPatients[0].symptoms}&quot;</span></p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12 italic text-sm">
                No active patients in {doctorDept}.
              </div>
            )}
          </div>

          {filteredPatients.length > 0 && (
            <button 
              onClick={() => updateStatus(filteredPatients[0].unique_token_id, 'Completed')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-4"
            >
              <CheckCircle size={16} /> Mark as Checked & Call Next
            </button>
          )}
        </div>

        {/* WAITING QUEUE LIST */}
        <div className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col h-80">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Upcoming Queue List</h2>
            <span className="bg-slate-900 px-2.5 py-0.5 rounded-full text-xs text-emerald-400 border border-slate-700">{filteredPatients.length} Waiting</span>
          </div>

          <div className="overflow-y-auto flex-1 pr-1 space-y-2 custom-scrollbar">
            {filteredPatients.slice(1).map((patient, index) => (
              <div 
                key={patient._id} 
                className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between hover:border-slate-600 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-200">{patient.unique_token_id}</span>
                    <span className="text-sm text-slate-300 font-medium">{patient.name}</span>
                    <span className="text-xs text-slate-500">({patient.age} Y / {patient.gender})</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5">Symptoms: {patient.symptoms}</p>
                </div>
                
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded-md font-mono">
                  Wait #{index + 1}
                </span>
              </div>
            ))}

            {filteredPatients.length <= 1 && (
              <div className="text-center text-slate-600 py-16 text-xs italic">
                No upcoming patients behind this one.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}