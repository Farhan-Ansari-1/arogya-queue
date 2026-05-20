"use client";

import { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2'; // Chart.js ko install karna padega
import { useRouter } from 'next/navigation';
import { Plus, Edit3, Save, Trash2, ToggleLeft, ToggleRight, Building2, UserPlus, Users, RefreshCw, LogOut, KeyRound } from 'lucide-react';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);

  // Department Form States
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);

  // Staff Form States
  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('Doctor');
  const [staffDept, setStaffDept] = useState(''); // For doctors
  const [staffRoom, setStaffRoom] = useState(''); // For doctors
  const [staffLoading, setStaffLoading] = useState(false);

  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRoom, setEditRoom] = useState('');

  // Analytics States
  const [analyticsData, setAnalyticsData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
  const [selectedAnalyticsDepartment, setSelectedAnalyticsDepartment] = useState('All');
  const [showTableView, setShowTableView] = useState(false);

  const router = useRouter();

  // 🔄 2. THE CHIEF FETCH FUNCTION (Wrapped inside useCallback to satisfy ESLint)
  const fetchAdminData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();
      if (data.success) {
        setTotalTokens(data.totalTokensToday);
        setDepartments(data.departments);
        setStaffList(data.staffMembers);
        if (data.departments.length > 0) {
          setStaffDept(prev => prev || data.departments[0].name);
        }
      }
    } catch (error) {
      console.error("Admin Data Fetch Error:", error);
    }
  }, []);

  // 📈 Analytics synchronization effect
  // Ye effect tab chalega jab authorized true ho ya filters change hon
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (authorized) {
        try {
          const response = await fetch(`/api/admin/analytics?timeframe=${selectedTimeframe}&department=${selectedAnalyticsDepartment}`);
          const data = await response.json();
          if (data.success) {
            setAnalyticsData(data.data);
          } else {
            console.error("Failed to fetch analytics:", data.error);
          }
        } catch (error) {
          console.error("Analytics Fetch Error:", error);
        }
      }
    }
    fetchAnalytics();
  }, [authorized, selectedTimeframe, selectedAnalyticsDepartment]);

  // �️ 1 & 3. CONSOLIDATED SECURITY & DATA FETCH (Prevents cascading renders)
  // Chart.js registration (only once)
  useEffect(() => {
    // Dynamically import Chart.js components to avoid server-side rendering issues
    import('chart.js').then(Chart => {
      Chart.Chart.register(
        Chart.CategoryScale,
        Chart.LinearScale,
        Chart.PointElement,
        Chart.LineElement,
        Chart.Title,
        Chart.Tooltip,
        Chart.Legend
      );
    });
  }, []);


  useEffect(() => {
    const initDashboard = async () => {
      const role = localStorage.getItem('userRole');
      if (role !== 'Admin') {
        router.push('/login');
      } else {
        setAuthorized(true);
        fetchAdminData();
      }
    };
    initDashboard();
  }, [router, fetchAdminData]);

  // 📊 Chart Data Generator
  const getChartData = () => {
    if (!analyticsData || analyticsData.length === 0) return { labels: [], datasets: [] };

    const labelsSet = new Set();
    const departmentData = {};

    analyticsData.forEach(item => {
      let label = `${item._id.year}`;
      if (item._id.month) label += `-${String(item._id.month).padStart(2, '0')}`;
      if (item._id.day) label += `-${String(item._id.day).padStart(2, '0')}`;
      
      labelsSet.add(label);
      const dept = item._id.department || 'Total';
      if (!departmentData[dept]) departmentData[dept] = {};
      departmentData[dept][label] = item.count;
    });

    const sortedLabels = Array.from(labelsSet).sort();
    const datasets = Object.keys(departmentData).map((dept, i) => ({
      label: dept,
      data: sortedLabels.map(l => departmentData[dept][l] || 0),
      borderColor: ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f87171'][i % 5],
      backgroundColor: 'transparent',
      tension: 0.3,
      pointRadius: 4
    }));

    return { labels: sortedLabels, datasets };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 10 } } },
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(51, 65, 85, 0.5)' } },
      y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(51, 65, 85, 0.5)' }, beginAtZero: true }
    }
  };

  // 📥 Download CSV Logic
  const handleDownload = () => {
    if (!analyticsData || analyticsData.length === 0) {
      alert("No data available to download / डाउनलोड करने के लिए कोई डेटा नहीं है।");
      return;
    }

    const isOverall = selectedTimeframe === 'overall';

    // Headers
    const headers = isOverall 
      ? ["Department", "PatientCount"] 
      : ["Year", "Month", "Day", "Department", "PatientCount"];
    
    // Formatting data for CSV
    const rows = analyticsData.map(item => {
      if (isOverall) {
        return [item._id.department || "All", item.count];
      }
      return [
        item._id.year,
        item._id.month || "-",
        item._id.day || "-",
        item._id.department || "All",
        item.count
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `IGM_Analytics_${selectedTimeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setDeptLoading(true);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentName, departmentCode })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setDepartmentName('');
        setDepartmentCode('');
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add department.");
    } finally {
      setDeptLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'DEPARTMENT' })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Connection error while deleting.");
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: staffUsername,
          password: staffPassword,
          name: staffName,
          role: staffRole,
          department: staffRole === 'Doctor' ? staffDept : null,
          roomNumber: staffRole === 'Doctor' ? staffRoom : null,
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setStaffName('');
        setStaffUsername('');
        setStaffPassword('');
        setStaffRole('Doctor');
        setStaffDept(departments.length > 0 ? departments[0].name : '');
        setStaffRoom('');
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add staff.");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm("Remove this staff member permanently?")) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'STAFF' })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Failed to remove staff");
      }
    } catch (error) {
      console.error(error);
      alert("Connection error while removing staff.");
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editName,
          department: editDept,
          roomNumber: editRoom,
        })
      });
      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    }
  };

  const handleResetPassword = async (id) => {
    const newPassword = window.prompt("Enter New Password / नया पासवर्ड डालें (min 4 chars):");
    
    if (!newPassword || newPassword.length < 4) {
      if (newPassword) alert("Password too short! / पासवर्ड बहुत छोटा है।");
      return;
    }

    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: newPassword })
      });
      const data = await response.json();
      if (data.success) {
        alert("Password updated successfully! / पासवर्ड बदल दिया गया है।");
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Reset Failed.");
    }
  };

  const toggleAvailability = async (staffMember) => {
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: staffMember._id,
          isAvailable: !staffMember.isAvailable,
        })
      });
      fetchAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.clear();
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-sm font-mono animate-pulse text-slate-400">Verifying Admin Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="text-blue-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Control Panel</h1>
            <p className="text-xs text-slate-400">I.G.M. Hospital — Centralized Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-lg text-slate-400 hover:text-blue-400 transition-all"
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

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-400">Total Tokens Today</p>
          <p className="text-3xl font-bold text-blue-400">{totalTokens}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-400">Active Departments</p>
          <p className="text-3xl font-bold text-emerald-400">{departments.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-400">Total Staff</p>
          <p className="text-3xl font-bold text-purple-400">{staffList.length}</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="max-w-7xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl mt-8">
        <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-3 mb-4 flex items-center justify-between">
          <span>📊 Department Analytics</span>
          <div className="flex gap-2">
            <select
              value={selectedAnalyticsDepartment}
              onChange={(e) => setSelectedAnalyticsDepartment(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="6month">Last 6 Months</option>
              <option value="yearly">Last Year</option>
              <option value="overall">Overall</option>
            </select>
            <button
              onClick={() => setShowTableView(!showTableView)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-1 px-3 rounded-lg text-xs transition-all"
            >
              {showTableView ? "Show Graph" : "Show Table"}
            </button>
            {/* Download button will go here */}
          </div>
        </h2>

        {showTableView ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-200 uppercase bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Date/Period</th>
                  <th scope="col" className="px-6 py-3">Department</th>
                  <th scope="col" className="px-6 py-3">Patients</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((item, index) => (
                  <tr key={index} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700">
                    <td className="px-6 py-4 font-medium text-slate-100 whitespace-nowrap">
                      {item._id.year}
                      {item._id.month ? `-${String(item._id.month).padStart(2, '0')}` : ''}
                      {item._id.day ? `-${String(item._id.day).padStart(2, '0')}` : ''}
                    </td>
                    <td className="px-6 py-4">{item._id.department || 'N/A'}</td>
                    <td className="px-6 py-4">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-80"> {/* Adjust height as needed */}
            {analyticsData.length > 0 && selectedTimeframe !== 'overall' ? (
              <Line data={getChartData()} options={chartOptions} />
            ) : (
              <p className="text-center text-slate-500 mt-20">No data available for graph or &apos;Overall&apos; timeframe selected.</p>
            )}
          </div>
        )}
        <button
          onClick={handleDownload}
          className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-all shadow-lg flex items-center gap-2"
        >
          Download Data (CSV)
        </button>
      </div>

      {/* Forms and Lists */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Department */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-3 mb-4">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department Name</label>
              <input
                type="text" required value={departmentName} onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Cardiology"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department Code (Short)</label>
              <input
                type="text" required value={departmentCode} onChange={(e) => setDepartmentCode(e.target.value)}
                maxLength={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 uppercase"
                placeholder="e.g., CARD"
              />
            </div>
            <button
              type="submit" disabled={deptLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-700"
            >
              {deptLoading ? "Adding..." : <><Plus size={16} /> Add Department</>}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-700 pt-4">
            <h3 className="text-md font-semibold text-slate-300 mb-3">Existing Departments</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {departments.map(dept => (
                <div key={dept._id} className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-2 flex items-center justify-between text-xs font-mono">
                  <p className="text-slate-200">{dept.name} <span className="text-slate-500">({dept.code})</span></p>
                  <button onClick={() => handleDeleteDepartment(dept._id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Staff */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-3 mb-4">Add New Staff Member</h2>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text" required value={staffName} onChange={(e) => setStaffName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                placeholder="Staff Member Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                <input
                  type="text" required value={staffUsername} onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 lowercase"
                  placeholder="Unique username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Secure Password</label>
                <input
                  type="password" required value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  placeholder="Create password"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
              <select
                value={staffRole} onChange={(e) => setStaffRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
              </select>
            </div>
            {staffRole === 'Doctor' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                  <select
                    value={staffDept} onChange={(e) => setStaffDept(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Room Number</label>
                  <input
                    type="text" value={staffRoom} onChange={(e) => setStaffRoom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                    placeholder="e.g., 101"
                  />
                </div>
              </div>
            )}
            <button
              type="submit" disabled={staffLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-700"
            >
              {staffLoading ? "Adding..." : <><UserPlus size={16} /> Add Staff</>}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-700 pt-4">
            <h3 className="text-md font-semibold text-slate-300 mb-3">Existing Staff</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {staffList.map(staff => (
                <div key={staff._id} className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                  <div>
                    <p className="text-slate-200 font-bold font-sans text-sm">{staff.name}</p>
                    <p className="text-slate-400 mt-0.5">Username: <strong className="text-blue-400">{staff.username}</strong> | Password: <span className="text-slate-600">••••••••</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${staff.role === 'Doctor' ? 'bg-blue-950 text-blue-400 border-blue-800' : 'bg-purple-950 text-purple-400 border-purple-800'}`}>
                      {staff.role}
                    </span>
                    {staff.role === 'Doctor' && (
                      <button onClick={() => toggleAvailability(staff)} className="flex items-center gap-1 text-xs">
                        {staff.isAvailable ? <span className="text-emerald-400 flex items-center gap-1 cursor-pointer"><ToggleRight size={22} /> Duty On</span> : <span className="text-red-400 flex items-center gap-1 cursor-pointer"><ToggleLeft size={22} /> Off Duty</span>}
                      </button>
                    )}
                    {editingId === staff._id ? (
                      <button onClick={() => handleSaveEdit(staff._id)} className="text-emerald-400 hover:text-emerald-300 p-1 flex items-center gap-1 text-xs bg-emerald-950/40 px-2 rounded border border-emerald-800"><Save size={14} /> Save</button>
                    ) : (
                      <button onClick={() => {
                        setEditingId(staff._id);
                        setEditName(staff.name);
                        setEditDept(staff.department);
                        setEditRoom(staff.roomNumber);
                      }} className="text-slate-400 hover:text-slate-200 p-1"><Edit3 size={14} /></button>
                    )}
                    <button 
                      onClick={() => handleResetPassword(staff._id)}
                      title="Reset Password"
                      className="text-amber-500 hover:text-amber-400 p-1"
                    >
                      <KeyRound size={14} />
                    </button>
                    <button onClick={() => handleDeleteStaff(staff._id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}