"use client";

import { useState } from "react";
import { X, MapPin, Clock, Info, Navigation } from "lucide-react";

interface AboutWidgetProps {
  business: any;
}

export default function AboutWidget({ business }: AboutWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white text-black py-4 rounded-xl shadow-lg hover:bg-gray-100 transition flex items-center justify-center relative font-bold mt-4"
      >
        <span className="text-lg tracking-wide uppercase">О нас</span>
        <Info size={20} className="absolute right-6 opacity-60" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[30px] overflow-hidden relative text-slate-900 shadow-2xl animate-in slide-in-from-bottom flex flex-col max-h-[90vh]">
        
        {/* Кнопка закрыть */}
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-4 right-4 p-2 bg-black/10 backdrop-blur-md text-white rounded-full hover:bg-black/20 z-10"
        >
          <X size={20} />
        </button>

        {/* Фото заведения (берем header_url или bg_image) */}
        <div className="h-56 w-full relative">
          <img 
            src={business.header_url || business.bg_image} 
            alt="Establishment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="p-8 -mt-12 relative bg-white rounded-t-[30px] flex-1 overflow-y-auto">
          <h3 className="text-3xl font-bold mb-2 uppercase tracking-tighter">{business.name}</h3>
          
          <p className="text-gray-600 mb-8 leading-relaxed italic">
            {business.description || "Мы создаем красоту и стиль для каждого клиента."}
          </p>

          <div className="space-y-6">
            {/* Адрес */}
            <div className="flex items-start gap-4">
              <div className="bg-slate-100 p-3 rounded-2xl text-slate-900">
                <MapPin size={24} />
              </div>
              <div>
                <div className="text-xs uppercase text-gray-400 font-bold tracking-widest">Адрес</div>
                <div className="text-lg font-medium">{business.address || "Адрес не указан"}</div>
              </div>
            </div>

            {/* График */}
            <div className="flex items-start gap-4">
              <div className="bg-slate-100 p-3 rounded-2xl text-slate-900">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-xs uppercase text-gray-400 font-bold tracking-widest">График работы</div>
                <div className="text-lg font-medium">{business.working_hours || "Пн-Вс: 10:00 - 20:00"}</div>
              </div>
            </div>
          </div>

          {/* Плашка Как добраться */}
          {business.map_link && (
            <a 
              href={business.map_link}
              target="_blank"
              className="mt-10 w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-center flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-xl"
            >
              <Navigation size={20} />
              КАК ДОБРАТЬСЯ
            </a>
          )}
        </div>

        <div className="p-4 text-center text-gray-300 text-[10px] uppercase tracking-widest">
          Linkalink info system
        </div>
      </div>
    </div>
  );
}