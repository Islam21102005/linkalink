"use client";

import { useState } from "react";
import { X, MapPin, Clock, Info, Navigation, ChevronRight, ChevronLeft } from "lucide-react";

export default function AboutWidget({ business }: { business: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const days = [
    { n: "Пн", h: "10-21" }, { n: "Вт", h: "10-21" }, { n: "Ср", h: "10-21" },
    { n: "Чт", h: "10-21" }, { n: "Пт", h: "10-22" }, { n: "Сб", h: "11-22" }, { n: "Вс", h: "11-20" },
  ];

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="w-full h-16 bg-white text-black rounded-2xl shadow-xl flex items-center justify-center relative font-bold hover:bg-gray-50 transition-all active:scale-[0.98]">
        <span className="text-lg tracking-[0.2em] uppercase">О нас</span>
        <Info size={20} className="absolute right-6 opacity-40" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[420px] rounded-[40px] overflow-hidden relative text-slate-900 shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
        
        <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 p-2 bg-black/20 backdrop-blur-xl text-white rounded-full hover:bg-black/40 z-50 transition">
          <X size={24} />
        </button>

        {/* Фото ИЛИ Видео */}
        <div className="h-64 w-full relative shrink-0 bg-black">
          {business.video_url ? (
             <iframe 
               src={business.video_url} 
               className="w-full h-full" 
               allow="autoplay; encrypted-media" 
               allowFullScreen
             ></iframe>
          ) : (
             <div className="flex overflow-x-auto snap-x snap-mandatory h-full no-scrollbar">
                {(business.gallery || [business.bg_image]).map((img: string, i: number) => (
                  <div key={i} className="min-w-full h-full snap-center">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
             </div>
          )}
        </div>

        {/* КОНТЕНТ */}
        <div className="p-8 overflow-y-auto no-scrollbar">
          <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">{business.name}</h3>
          
          <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
            {business.description || "Премиальное пространство вашего стиля."}
          </p>

          <div className="space-y-8">
            {/* ГРАФИК */}
            <div>
                <div className="flex items-center gap-2 mb-3 opacity-40">
                    <Clock size={16} />
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">График</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, i) => (
                        <div key={i} className={`py-2 rounded-lg border text-center ${i === (new Date().getDay() || 7) - 1 ? 'bg-black text-white' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="text-[9px] font-bold mb-1">{day.n}</div>
                            <div className="text-[8px] font-black">{day.h}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* АДРЕС */}
            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <MapPin size={24} className="opacity-30" />
                <div>
                    <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Локация</div>
                    <div className="text-sm font-bold">{business.address || "Центр города"}</div>
                </div>
            </div>

            {/* КАРТЫ */}
            {business.map_link && (
                <a href={business.map_link} target="_blank" className="w-full bg-black text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform uppercase tracking-widest text-sm">
                   Построить маршрут
                </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}