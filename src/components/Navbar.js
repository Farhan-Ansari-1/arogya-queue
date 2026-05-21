"use client";
import { Hospital, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar({ isMenuOpen, setIsMenuOpen, scrollToForm }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-blue-50 shadow-sm">
              <Image 
                src="/logo.png" 
                alt="IGM Hospital Logo" 
                fill
                sizes="40px"
                className="object-cover" 
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-slate-800 tracking-tight text-lg">IGM Hospital</span>
              <span className="text-[10px] text-blue-600 font-semibold tracking-widest uppercase">Bhiwandi</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#self-care" className="hover:text-blue-600 transition-colors">Self Care</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact Us</a>
            <Link 
              href="/#token-form"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Get Online Slip
            </Link>
          </div>

          <button className="md:hidden text-slate-600 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl">
          <div className="flex flex-col p-4 gap-4 text-slate-700 font-medium">
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-lg">About</a>
            <a href="#self-care" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-lg">Self Care</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-lg">Contact Us</a>
            <Link 
              href="/#token-form"
              onClick={() => setIsMenuOpen(false)}
              className="bg-blue-600 text-white px-4 py-4 rounded-2xl font-black text-center shadow-lg shadow-blue-200"
            >
              Get Online Slip
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}