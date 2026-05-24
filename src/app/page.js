"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  User,
  Calendar,
  Users,
  Smartphone,
  MessageSquare,
  Fingerprint,
  Loader2,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  Info,
} from "lucide-react";
import Image from "next/image";
import PrintableSlip from "@/components/PrintableSlip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PatientPortal() {
  const [formData, setFormData] = useState({
    aadhaar: "",
    name: "",
    dob: "",
    gender: "Male",
    mobile: "",
    symptoms: "",
  });
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // To store the token generation result
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToForm = () => {
    document.getElementById("token-form")?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Aadhaar check: Sirf numbers allow karein
    if (name === "aadhaar" && value !== "" && !/^\d+$/.test(value)) return;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔍 Auto-fill Logic: Jaise hi Aadhaar 12 digit ka ho, lookup karo
  useEffect(() => {
    const lookupPatient = async () => {
      if (formData.aadhaar.length === 12) {
        setIsLookupLoading(true);
        try {
          const res = await fetch("/api/patient/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aadhaar: formData.aadhaar }),
          });
          const result = await res.json();
          
          if (result.success && result.exists) {
            const p = result.data;
            // Date format convert karna padta hai HTML date input ke liye (YYYY-MM-DD)
            const formattedDOB = p.dob ? new Date(p.dob).toISOString().split('T')[0] : "";
            
            setFormData(prev => ({
              ...prev,
              name: p.name,
              dob: formattedDOB,
              gender: p.gender,
              mobile: p.mobile
            }));
            console.log("✅ Patient found! Auto-filled details.");
          }
        } catch (err) {
          console.error("Lookup failed:", err);
        } finally {
          setIsLookupLoading(false);
        }
      }
    };

    lookupPatient();
  }, [formData.aadhaar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null); // Clear previous result

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
        // Optionally clear form after successful submission
        setFormData({
          aadhaar: "",
          name: "",
          dob: "",
          gender: "Male",
          mobile: "",
          symptoms: "",
        });
      } else {
        setError(data.error || "Token generation failed.");
      }
    } catch (err) {
      console.error("Token Request Error:", err);
      setError("Server se judne mein dikkat. Kripya dobara prayas karein.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate age from DOB for the slip
  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    return new Date().getFullYear() - birthDate.getFullYear();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} scrollToForm={scrollToForm} />

      {/* 🏔️ Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background with Overlay */}
        <div className="absolute inset-0 bg-[url('/hospital-bg.png')] bg-cover bg-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md uppercase">
            Indira Gandhi Memorial Hospital
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-blue-300 mb-8 tracking-wide">
            इंदिरा गांधी स्मृति रुग्णालय
          </h2>
          <p className="text-slate-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
            Bhiwandi&apos;s most trusted government facility, now powered by AI for faster treatments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToForm}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/40 active:scale-95"
            >
              Get Token Now / टोकन प्राप्त करें
            </button>
            <a 
              href="tel:02522226282"
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
            >
              Emergency: 02522-226282
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* 🏥 Services Quick Stats */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Clock size={24} />, label: "24/7 Service", sub: "Emergency Care" },
            { icon: <Users size={24} />, label: "50+ Doctors", sub: "Specialists" },
            { icon: <HeartPulse size={24} />, label: "Modern ICU", sub: "Advanced Care" },
            { icon: <Stethoscope size={24} />, label: "Free OPD", sub: "Govt. Scheme" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="text-blue-600 mb-2 flex justify-center">{stat.icon}</div>
              <h3 className="font-bold text-slate-800">{stat.label}</h3>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🏥 About Us Section */}
      <section id="about" className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-4xl overflow-hidden shadow-2xl group">
            <Image 
              src="/hospital-bg.png" 
              alt="IGM Hospital Building" 
              width={800}
              height={600}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-all"></div>
          </div>
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest">
              <Info size={14} /> Since 1995
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-800 uppercase tracking-tighter leading-[0.9]">
              Bhiwandi&apos;s Trusted Healthcare Legacy
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Indira Gandhi Memorial (IGM) Hospital has served as the medical backbone of Bhiwandi for over 30 years. We are a premier government institution dedicated to providing high-quality, accessible medical care to every citizen.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div><p className="text-3xl font-black text-blue-600">40+</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Years</p></div>
              <div><p className="text-3xl font-black text-blue-600">50+</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctors</p></div>
              <div><p className="text-3xl font-black text-blue-600">1M+</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patients</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* 📝 Main Token Section */}
      <section id="token-form" className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Instructions Column */}
          <div className="space-y-8 py-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 mb-4">Fastest OPD Ticketing</h2>
              <p className="text-slate-600 leading-relaxed">
                Skip the long physical queues at the reception. Our AI-powered system analyzes your symptoms and assigns you to the right department instantly.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { step: "01", title: "Enter Aadhaar", desc: "Auto-fetches your data if you've visited before." },
                { step: "02", title: "Tell Symptoms", desc: "Write how you feel in Hindi or English." },
                { step: "03", title: "Get Token", desc: "Show the digital slip at the assigned cabin." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                  <span className="text-2xl font-black text-blue-200">{item.step}</span>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0"></div>
            
            <div className="relative z-10">
        {result ? (
          <div className="space-y-6">
            <PrintableSlip
              result={result}
              name={result.name}
              age={result.age}
              gender={result.gender}
              mobile={result.mobile}
            />
            <button 
              onClick={() => setResult(null)}
              className="w-full text-blue-600 font-bold text-sm hover:underline py-2"
            >
              ← Register New Patient / नया टोकन जनरेट करें
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Generate Digital Token</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">डिजिटल टोकन जनरेट करें</p>
            </div>

            {error && <div className="mb-5 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 animate-shake text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Aadhaar Number */}
              <div>
                <label
                  htmlFor="aadhaar"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Aadhaar Number / आधार नंबर
                </label>
                <div className="relative">
                  <Fingerprint
                    className={`absolute left-3 top-2.5 ${isLookupLoading ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`}
                    size={16}
                  />
                  <input
                    type="text"
                    id="aadhaar"
                    name="aadhaar"
                    value={formData.aadhaar}
                    onChange={handleChange}
                    placeholder="12-digit Aadhaar / 12 अंकों का आधार"
                    required
                    maxLength={12}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Full Name / पूरा नाम
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Date of Birth / जन्म तिथि
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={16}
                    />
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Gender / लिंग
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={16}
                    />
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Mobile Number / मोबाइल नंबर
                </label>
                <div className="relative">
                  <Smartphone
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={16}
                  />
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                    pattern="[0-9]{10}"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label
                  htmlFor="symptoms"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Symptoms / लक्षण
                </label>
                <div className="relative">
                  <MessageSquare
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={16}
                  />
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    placeholder="Describe symptoms..."
                    rows="2"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all text-lg flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> AI Analyzing...
                  </>
                ) : (
                  <>Confirm Registration</>
                )}
              </button>
            </form>
          </>
        )}
            </div>
          </div>
        </div>
      </section>

      {/* 📘 Self Care & Health Tips Section */}
      <section id="self-care" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-slate-800 mb-12 uppercase tracking-tighter">Your Health, Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm text-left">
              <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Info size={24} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">Daily Wellness</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                IGM Hospital recommends drinking at least 3 liters of water daily to stay hydrated during Bhiwandi&apos;s humid months.
              </p>
            </div>
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm text-left">
              <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">Heatstroke Care</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                If you feel dizzy or have a sudden fever, avoid direct sunlight and visit our General Medicine ward immediately.
              </p>
            </div>
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm text-left">
              <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">Maternal Health</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our Gynecologist is available every Monday to Friday. Regular checkups are free for local residents.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
