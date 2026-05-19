"use client";

import React, { useRef, useState, useEffect } from "react";
import { Printer } from "lucide-react";

export default function PrintableSlip({ result, name, age, gender, mobile }) {
  const slipRef = useRef();
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => {
      setCurrentDate(new Date().toLocaleDateString("en-IN"));
      setCurrentTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      setMounted(true);
    });
  }, []);

  if (!result) return null;
  
  // Mismatch se bachne ke liye hydration tak wait karein
  if (!mounted) return <div className="p-10 text-center text-slate-500">Generating Slip...</div>;

  const handlePrint = () => {
    const content = slipRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hospital Token Slip</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            .text-center { text-align: center; }
            /* Tailwinds styles ko yahan inline copy kar sakte ho ya basic CSS likh sakte ho */
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="w-full space-y-4">
      {/* 📄 REAL HOSPITAL BLUEPRINT LAYOUT */}
      <div
        ref={slipRef}
        className="bg-white text-black p-6 rounded-xl border border-slate-200 shadow-sm max-w-sm mx-auto text-left font-mono"
        id="hospital-token-slip"
      >
        {/* Hospital Header */}
        <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3 space-y-0.5">
          <h2 className="text-md font-black tracking-wide uppercase">
            I.G.M. HOSPITAL, BHIWANDI
          </h2>
          <p className="text-[10px] text-gray-600 uppercase font-sans font-bold">
            OPD Smart Queue System
          </p>
          <p className="text-[9px] text-gray-500 font-sans">
            Date: {currentDate} | Time: {currentTime}
          </p>
        </div>

        {/* Big Bold Token Code */}
        <div className="text-center my-3 py-2 border-2 border-black rounded-lg bg-gray-50">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-sans font-bold">
            TOKEN NUMBER / टोकन संख्या
          </p>
          <h1 className="text-4xl font-black tracking-widest text-black mt-1">
            {result.unique_token_id || "AQ-MED-00"}
          </h1>
        </div>

        {/* Patient Vital Info */}
        <div className="space-y-1 text-xs border-b-2 border-dashed border-black pb-3 mb-3">
          <p>
            <span className="font-bold">PATIENT NAME :</span>{" "}
            <span className="uppercase">{name || "ANONYMOUS"}</span>
          </p>
          <p>
            <span className="font-bold">AGE / SEX :</span> {age || "00"} Y /{" "}
            {gender || "M"}
          </p>
          <p>
            <span className="font-bold">MOBILE NO :</span> +91{" "}
            {mobile || "0000000000"}
          </p>
        </div>

        {/* DYNAMIC DOCTOR & ROOM ASSIGNMENT */}
        <div className="space-y-2 text-xs border-b-2 border-dashed border-black pb-3 mb-3">
          <p>
            <span className="font-bold">ASSIGNED DEPT:</span>{" "}
            <span className="uppercase text-sm font-black">
              {result.assigned_department}
            </span>
          </p>
          <p>
            <span className="font-bold">CONSULTANT :</span>{" "}
            <span className="uppercase font-bold text-gray-800">
              {result.doctor_name || "ON DUTY DOCTOR"}
            </span>
          </p>
          <p>
            <span className="font-bold">ROOM NUMBER :</span>{" "}
            <span className="uppercase font-black text-sm bg-gray-100 px-1 border border-black/10">
              {result.room_number || "CHECK COUNTER"}
            </span>
          </p>
        </div>

        {/* Footer Guidance */}
        <div className="text-center mt-3">
          <p className="text-[9px] text-gray-600 leading-tight font-sans">
            Please sit outside the assigned room number. Your Token ID will be
            flashed on the doctor&apos;s cabin indicator screen.
          </p>
          <p className="text-[9px] font-bold mt-1 font-sans text-gray-800">
            कृपया आवंटित कमरा नंबर के बाहर बैठें। आपकी बारी आने पर सूचित किया
            जाएगा।
          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex gap-3 justify-center max-w-sm mx-auto">
        <button
          onClick={handlePrint}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Printer size={14} /> Print / Save Slip
        </button>
      </div>
    </div>
  );
}
