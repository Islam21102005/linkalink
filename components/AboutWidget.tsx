"use client";

import { useState } from "react";
import { X, MapPin, Clock, Info, Navigation, Star } from "lucide-react";

interface AboutWidgetProps {
  business: any;
}

export default function AboutWidget({ business }: AboutWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Список дней для интересного отображения графика
  const days = [
    { n: "Пн", h: "10:00 - 21:00" },
    { n: "Вт", h: "10:00 - 21:00" },
    { n: "Ср", h: "10:00 - 21:00" },
    { n: "Чт", h: "10:00 - 21:00" },
    { n: "Пт", h: "10:00 - 22:00" },
    { n: "Сб", h: "11:00 - 22:00" },
    { n: "Вс", h: "11:00 - 20:00" },
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white text-black py-4 rounded-xl shadow-lg hover:bg-gray-100 transition flex items-center justify-center relative font-bold mb-4"
      >
        <span className="text-lg tracking-widest uppercase">О нас</span>
        <Info size={20} className="absolute right-6 opacity-60" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-[480px] rounded-t-[40px] overflow-hidden relative text-slate-900 shadow-2xl animate-in slide-in-from-bottom flex flex-col h-[92vh]">
        
        {/* Хедер модалки */}
        <div className="absolute top-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
        </div>
        
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-5 right-5 p-2 bg-black/20 backdrop-blur-xl text-white rounded-full hover:bg-black/40 z-30 transition"
        >
          <X size={24} />
        </button>

        {/* --- ГАЛЕРЕЯ СО СВАЙПОМ --- */}
        <div className="relative h-[45%] w-full bg-slate-200">
          <div className="flex overflow-x-auto snap-x snap-mandatory h-full no-scrollbar bg-slate-900">
            {business.gallery && business.gallery.length > 0 ? (
              business.gallery.map((img: string, i: number) => (
                <div key={i} className="min-w-full h-full snap-center relative">
                  <img src={img} alt={`Photo ${i}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
                </div>
              ))
            ) : (
              <img src={business.bg_image} className="w-full h-full object-cover" />
            )}
          </div>
          {/* Подсказка "Листайте" */}
          <div className="absolute bottom-12 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter">
            Листайте фото →
          </div>
        </div>

        {/* --- КОНТЕНТ --- */}
        <div className="p-8 -mt-10 relative bg-white rounded-t-[40px] flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Премиум сервис</span>
          </div>
          <h3 className="text-4xl font-extrabold mb-4 uppercase tracking-tighter leading-none">{business.name}</h3>
          
          <p className="text-gray-600 text-sm mb-10 leading-relaxed font-medium">
            {business.description}
          </p>

          <div className="space-y-10">
            {/* ГРАФИК (КРЕАТИВНЫЙ ГРИД) */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-slate-900">
                    <Clock size={18} strokeWidth={2.5} />
                    <span className="text-xs uppercase font-black tracking-widest">Режим работы</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {days.map((day, i) => (
                        <div key={i} className={`p-2 rounded-xl border text-center ${i === new Date().getDay() - 1 ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="text-[10px] uppercase font-bold mb-1 opacity-60">{day.n}</div>
                            <div className="text-[9px] font-black leading-tight">{day.h.split(' - ')[0]}<br/>{day.h.split(' - ')[1]}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* АДРЕС */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <MapPin size={24} className="text-slate-900" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Локация</div>
                        <div className="text-sm font-bold">{business.address || "Центр города"}</div>
                    </div>
                </div>
            </div>

            {/* ПЛАШКА КАК ДОБРАТЬСЯ */}
            {business.map_link && (
                <a 
                href={business.map_link}
                target="_blank"
                className="w-full bg-slate-900 text-white py-5 rounded-[20px] font-bold text-center flex items-center justify-center gap-3 hover:scale-[0.98] transition-transform shadow-2xl"
                >
                <Navigation size={20} fill="white" />
                <span className="tracking-widest text-sm">ПОСТРОИТЬ МАРШРУТ</span>
                </a>
            )}
          </div>

          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}