"use client";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:gap-3 transition-all">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Terms of Service</h1>
        </div>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the ArogyaQueue system, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Use of Service</h2>
            <p>
              ArogyaQueue is provided for the purpose of facilitating patient registration and queue management at I.G.M. Hospital, Bhiwandi. Any misuse or unauthorized access is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Accuracy of Information</h2>
            <p>
              Users are responsible for providing accurate and truthful information during registration. Providing false information may lead to denial of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Disclaimer</h2>
            <p>
              ArogyaQueue is a management tool and does not provide medical advice. All medical decisions should be made by qualified healthcare professionals.
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