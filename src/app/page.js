"use client";

import { useState, useEffect } from "react";
import {
  Hospital,
  Phone,
  MapPin,
  Clock,
  User,
  Calendar,
  Users,
  Smartphone,
  MessageSquare,
  Fingerprint,
  Loader2,
} from "lucide-react";
import PrintableSlip from "@/components/PrintableSlip";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-between p-4">
      {/* Header */}
      <header className="w-full max-w-md text-center py-6">
        <div className="inline-flex p-3 bg-blue-100 rounded-2xl mb-2">
          <Hospital className="text-blue-600" size={32} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Indira Gandhi Memorial Hospital
        </h1>
        <p className="text-lg md:text-xl font-bold text-slate-700 mt-1">
          इंदिरा गांधी मेमोरियल हॉस्पिटल
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Bhiwandi Trusted Care Center / भिवंडी का विश्वसनीय देखभाल केंद्र
        </p>
      </header>

      {/* Main Content - Form or Slip */}
      <main className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-lg mb-8">
        {result ? (
          <PrintableSlip
            result={result}
            name={formData.name}
            age={calculateAge(formData.dob)}
            gender={formData.gender}
            mobile={formData.mobile}
          />
        ) : (
          <>
            <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">
              Digital Token / डिजिटल टोकन
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm font-medium text-center bg-red-100 border border-red-300 text-red-700">
                {error}
              </div>
            )}

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
                    placeholder="Patient's Full Name / मरीज का पूरा नाम"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="Male">Male / पुरुष</option>
                      <option value="Female">Female / महिला</option>
                      <option value="Other">Other / अन्य</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
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
                    placeholder="10-digit Mobile No. / 10 अंकों का मोबाइल नंबर"
                    required
                    pattern="[0-9]{10}"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
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
                    placeholder="Ex: Fever, cough, headache / जैसे: बुखार, खांसी, सिरदर्द"
                    rows="3"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 mt-6 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Generating
                    Token...
                  </>
                ) : (
                  <>Generate Token / टोकन निकालें</>
                )}
              </button>
            </form>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-slate-600 text-xs mt-auto py-4 border-t border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-1">
          <MapPin size={14} />
          <p>Maruti Mandir Rd, Kacheri Pada, Bhiwandi, Maharashtra 421302</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Phone size={14} />
          <a href="tel:02522226282" className="hover:underline">
            02522 226 282
          </a>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Clock size={14} />
          <p>Open 24 hours / 24 घंटे खुला है</p>
        </div>
      </footer>
    </div>
  );
}
