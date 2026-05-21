"use client";
import Link from "next/link";
import { ArrowLeft, Handshake } from "lucide-react";

export default function GovernmentSchemes() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:gap-3 transition-all">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Handshake size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Government Schemes</h1>
        </div>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Ayushman Bharat Yojana</h2>
            <p>
              This scheme provides health coverage of up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization. Eligible beneficiaries can avail cashless treatment at I.G.M. Hospital.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)</h2>
            <p>
              A health insurance scheme for the economically weaker sections of Maharashtra, offering comprehensive health coverage for various medical procedures and treatments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Free OPD Services</h2>
            <p>
              I.G.M. Hospital provides free Out-Patient Department (OPD) consultations and basic diagnostic services to all citizens, ensuring access to primary healthcare without financial burden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Janani Shishu Suraksha Karyakram (JSSK)</h2>
            <p>
              A central government initiative to reduce maternal and infant mortality by providing free and cashless services to pregnant women and sick newborns.
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