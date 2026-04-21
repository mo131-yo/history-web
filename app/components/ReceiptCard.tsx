"use client"; // Next.js App Router ашиглаж байгаа бол заавал байх ёстой

import { ShieldCheck } from "lucide-react";
import QRCode from "react-qr-code"; // Нэрийг нь QRCode гэж стандарт хэлбэрээр нь оруулж ирье

export default function ReceiptCard({ lottery, qrData, amount }: any) {
  // qrData хоосон байвал алдаа өгөхөөс сэргийлж шалгана
  if (!qrData) return null;

  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-6 space-y-6 max-w-xs animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">E-Barimt</p>
          <h4 className="text-white font-black text-xl italic uppercase tracking-tighter">Receipt.</h4>
        </div>
        <div className="bg-emerald-500/10 p-2 rounded-xl">
          <ShieldCheck className="text-emerald-500" size={20} />
        </div>
      </div>

      {/* QR Code Section */}
      <div className="flex justify-center bg-white p-4 rounded-3xl">
        {/* Энд QRCode гэж бичнэ үү */}
        <QRCode 
          value={qrData} 
          size={150} 
          level="H" 
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
      </div>

      {/* Lottery Details */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Lottery No</p>
          <p className="text-white font-mono font-bold tracking-widest">{lottery}</p>
        </div>
        <div className="flex justify-between items-center px-2">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Amount</p>
          <p className="text-indigo-400 font-black tracking-tighter">{amount} ₮</p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <p className="text-[8px] text-gray-700 text-center uppercase font-black tracking-[0.2em]">
          Татварын Ерөнхий Газар баталгаажуулав
        </p>
      </div>
    </div>
  );
}