"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Monitor, ArrowRight, AlertTriangle } from "lucide-react";
import PrintableSlip from "@/components/PrintableSlip";

export default function ReceptionDesk() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [mobile, setMobile] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (["Receptionist", "Admin"].includes(role)) {
      Promise.resolve().then(() => {
        setAuthorized(true);
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-sm font-mono animate-pulse text-slate-400">Verifying Counter Credentials...</p>
      </div>
    );
  }

  const handleReceptionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, name, age, gender, mobile }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        alert(data.error || "Counter entry failed!");
      }
    } catch (error) {
      console.error("Reception Panel Error:", error);
      alert("Database connection error.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setName("");
    setAge("");
    setGender("Male");
    setMobile("");
    setSymptoms("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Top Banner */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 text-blue-400 text-3xl font-bold mb-1">
          <Monitor size={36} />
          <h1>ArogyaQueue Reception</h1>
        </div>
        <p className="text-slate-400 text-sm">
          I.G.M. Hospital, Bhiwandi — Main OPD Reception Counter
        </p>
      </div>

      <div className="w-full max-w-xl bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
        {!result ? (
          <form onSubmit={handleReceptionSubmit} className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h2 className="text-md font-semibold text-slate-200">
                New On-Spot Entry (Receptionist Panel)
              </h2>
              <span className="bg-blue-900/50 text-blue-400 border border-blue-700/50 text-xs px-2.5 py-1 rounded-full font-mono">
                Counter #1
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Patient Full Name (मरीज का नाम)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 uppercase text-sm"
                placeholder="Type patient's name..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Age (उम्र)
                </label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="Years"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Gender (लिंग)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Mobile Number (मोबाइल नंबर)
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="Enter 10 digit number"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Chief Complaints / Symptoms (बीमारी की शिकायत)
              </label>
              <textarea
                required
                rows="3"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                placeholder="Ask patient and type here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-700"
            >
              {loading ? (
                "AI Allocating Ward..."
              ) : (
                <>
                  Issue Official Token <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            {result.is_emergency ? (
              <div className="bg-red-950/50 border border-red-500 rounded-xl p-5 text-left space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-lg">
                  <AlertTriangle size={24} />
                  <span>CRITICAL EMERGENCY RED ALERT</span>
                </div>
                <p className="text-sm text-red-200">
                  Send this patient directly to Casualty counter immediately! Do
                  not print standard slip.
                </p>
                <div className="text-2xl font-black text-center text-red-400 bg-red-900/40 py-2 rounded-lg tracking-wider border border-red-500/30">
                  {result.unique_token_id}
                </div>
              </div>
            ) : (
              /* LIVE REUSABLE COMPONENT IMPORT FOR STAFF */
              <PrintableSlip
                result={result}
                name={name}
                age={age}
                gender={gender}
                mobile={mobile}
              />
            )}

            <button
              onClick={resetForm}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 rounded-lg text-sm transition-all"
            >
              Register Next Patient (अगला मरीज)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
