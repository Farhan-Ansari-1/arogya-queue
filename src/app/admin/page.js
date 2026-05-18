"use client";

import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, UserPlus, ToggleLeft, ToggleRight, Edit3, Save, Activity, FolderPlus, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);
  
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRoom, setEditRoom] = useState('');

  const fetchAdminData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();
      if (data.success) {
        setDoctors(data.doctors);
        setTotalTokens(data.totalTokensToday);
        setDepartments(data.departments);
        if (data.departments.length > 0 && !department) {
          setDepartment(data.departments[0].name);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [department]);

  useEffect(() => {
    // call fetchAdminData asynchronously to avoid setting state synchronously within the effect
    const init = async () => {
      await fetchAdminData();
    };
    init();
  }, [fetchAdminData]);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!department) return alert("Please add a department first!");
    setLoading(true);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, department, roomNumber })
      });
      const data = await response.json();
      if (data.success) {
        setName('');
        setRoomNumber('');
        fetchAdminData();
      }
    } catch (error) {
      alert("Error adding doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DEPARTMENT', deptName, deptCode })
      });
      const data = await response.json();
      if (data.success) {
        setDeptName('');
        setDeptCode('');
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error adding department");
    }
  };

  // 🗑️ Department Delete Handler
  const handleDeleteDepartment = async (id) => {
    if (!confirm("Are you sure? Is department ko hatane se iske andar ke routes close ho jayenge.")) return;
    try {
      const response = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        fetchAdminData(); // Refresh current components list
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAvailability = async (doctor) => {
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doctor._id, isAvailable: !doctor.isAvailable })
      });
      fetchAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName, department: editDept, roomNumber: editRoom })
      });
      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        fetchAdminData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Brand Bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-blue-500" size={36} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ArogyaQueue Master Admin</h1>
            <p className="text-xs text-slate-400">Hospital Dynamic Configuration Control Room</p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2">
          <Activity size={16} className="text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-300">Total Tokens Today: <strong className="text-emerald-400">{totalTokens}</strong></span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT CONFIGURATION PANEL */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* FORM A: CREATE DEPARTMENT */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
              <FolderPlus size={16} className="text-purple-400" /> Create Department
            </h2>
            <form onSubmit={handleAddDepartment} className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-slate-400 mb-1">Department Name</label>
                <input type="text" required value={deptName} onChange={(e) => setDeptName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500" placeholder="e.g., Ophthalmology" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Short Code (3 letters)</label>
                <input type="text" required maxLength={3} value={deptCode} onChange={(e) => setDeptCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 uppercase" placeholder="e.g., EYE" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-lg transition-all">Create Category</button>
            </form>

            {/* 📋 LIVE ACTIVE DEPARTMENTS MANAGING LIST */}
            <div className="border-t border-slate-700 pt-3 mt-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Categories</label>
              <div className="space-y-1.5 max-h-37.5 overflow-y-auto pr-1">
                {departments.map((d) => (
                  <div key={d._id} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
                    <span className="text-slate-200 font-medium">{d.name} <strong className="text-purple-400 font-mono text-[10px]">({d.code})</strong></span>
                    <button 
                      onClick={() => handleDeleteDepartment(d._id)}
                      className="text-slate-500 hover:text-red-400 p-0.5 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FORM B: ADD NEW DOCTOR */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
              <UserPlus size={16} className="text-blue-400" /> Add New Doctor
            </h2>
            <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Doctor Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500" placeholder="e.g., Dr. Farhan Ansari" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Select Active Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500">
                  {departments.map((d) => <option key={d._id} value={d.name}>{d.name} ({d.code})</option>)}
                  {departments.length === 0 && <option value="">No departments available</option>}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">OPD Room Number</label>
                <input type="text" required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500" placeholder="Room No. 12" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-all">{loading ? "Saving..." : "Deploy Doctor"}</button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTIVE ROSTER */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Current Active Doctors Roster</h2>
          <div className="space-y-3 max-h-145 overflow-y-auto pr-1">
            {doctors.map((doc) => (
              <div key={doc._id} className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                {editingId === doc._id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white" />
                    <select value={editDept} onChange={(e) => setEditDept(e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white">
                      {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <input type="text" value={editRoom} onChange={(e) => setEditRoom(e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white" />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-slate-200 text-md">{doc.name}</h3>
                    <div className="flex gap-4 text-xs text-slate-400 mt-1">
                      <span>Dept: <strong className="text-blue-400">{doc.department}</strong></span>
                      <span>Room: <strong className="text-slate-300">{doc.roomNumber}</strong></span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {editingId === doc._id ? (
                    <button onClick={() => handleSaveEdit(doc._id)} className="text-emerald-400 hover:text-emerald-300 p-1 flex items-center gap-1 text-xs bg-emerald-950/40 px-2 rounded border border-emerald-800"><Save size={14} /> Save</button>
                  ) : (
                    <button onClick={() => setEditingId(doc._id) || setEditName(doc.name) || setEditDept(doc.department) || setEditRoom(doc.roomNumber)} className="text-slate-400 hover:text-slate-200 p-1"><Edit3 size={14} /></button>
                  )}
                  <button onClick={() => toggleAvailability(doc)} className="flex items-center gap-1 text-xs">
                    {doc.isAvailable ? <span className="text-emerald-400 flex items-center gap-1 cursor-pointer"><ToggleRight size={22} /> Duty On</span> : <span className="text-red-400 flex items-center gap-1 cursor-pointer"><ToggleLeft size={22} /> Off Duty</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}