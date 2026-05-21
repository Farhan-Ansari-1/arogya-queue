"use client";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:gap-3 transition-all">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Privacy Policy</h1>
        </div>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
            <p>
              ArogyaQueue collects basic patient details including Aadhaar Number (hashed for security), Name, Date of Birth, Gender, Mobile Number, and Symptoms for the sole purpose of hospital registration and department allocation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. How We Use Information</h2>
            <p>
              Your information is used to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Generate unique OPD tokens and slips.</li>
              <li>Identify your medical history for future hospital visits.</li>
              <li>Allocate the most suitable medical department via AI analysis.</li>
              <li>Inform hospital staff of your current symptoms for efficient treatment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Data Security</h2>
            <p>
              We prioritize your privacy. Aadhaar numbers are never stored in plain text; they are encrypted using industry-standard SHA-256 hashing. Access to patient data is strictly limited to authorized medical staff and administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Third-Party Sharing</h2>
            <p>
              Your personal medical information is NOT shared with third-party advertisers or private entities. Data is only accessible within the I.G.M. Hospital network.
            </p>
          </section>

          <section className="pt-10 border-t border-slate-100">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Last Updated: May 2026 | I.G.M. Hospital, Bhiwandi
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}