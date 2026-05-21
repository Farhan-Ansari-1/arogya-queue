import Link from "next/link";
import { Hospital, MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Hospital className="text-blue-400" size={24} />
            <span className="font-black text-xl tracking-tight">IGM Hospital Bhiwandi</span>
          </div>
          <p className="text-slate-400 text-sm">
            Dedicated to providing affordable and high-quality healthcare to the citizens of Bhiwandi and surrounding regions.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Contact Details</h4>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex gap-2"><MapPin size={16} className="text-blue-400 shrink-0" /> <span>Maruti Mandir Rd, Kacheri Pada, Bhiwandi, Maharashtra 421302</span></div>
            <div className="flex gap-2"><Phone size={16} className="text-blue-400 shrink-0" /> <a href="tel:02522226282" className="hover:text-white">02522-226282</a></div>
            <div className="flex gap-2"><Clock size={16} className="text-blue-400 shrink-0" /> <span>Open 24 Hours (OPD: 10:00 AM - 01:00 PM)</span></div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/schemes" className="hover:text-white">Government Schemes</Link>
          </div>
        </div>
      </div>
      <div className="text-center pt-8 text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">
        © {new Date().getFullYear()} IGM Hospital Bhiwandi — Powered by AI Triage
      </div>
    </footer>
  );
}