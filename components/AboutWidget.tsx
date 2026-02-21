"use client";

import { useState } from "react";
import { X, MapPin, Clock, Info, ChevronLeft, ChevronRight } from "lucide-react";

const DAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

export default function AboutWidget({ business }: { business: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  // Gallery: prefer gallery_photos, fallback to bg_image
  const gallery: string[] = (() => {
    const g = business.gallery_photos || business.gallery;
    if (Array.isArray(g) && g.length > 0) return g;
    if (business.bg_image) return [business.bg_image];
    return [];
  })();

  // Schedule from business.schedule (object) or fallback hardcode
  const schedule = business.schedule || {};
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=Mon...6=Sun

  const formatHours = (dayData: any) => {
    if (!dayData) return "–";
    if (dayData.closed) return "Вых.";
    if (dayData.open && dayData.close) {
      return `${dayData.open.slice(0,5)}–${dayData.close.slice(0,5)}`;
    }
    return "–";
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-16 bg-white text-black rounded-2xl shadow-xl flex items-center justify-center relative font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
      >
        <span className="text-lg tracking-[0.2em] uppercase">О нас</span>
        <Info size={20} className="absolute right-6 opacity-40" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[420px] rounded-[40px] overflow-hidden relative text-slate-900 shadow-2xl flex flex-col max-h-[88vh]">
        
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 p-2 bg-black/20 backdrop-blur-xl text-gray-900 rounded-full hover:bg-black/40 z-50 transition"
        >
          <X size={22} />
        </button>

        {/* === CAROUSEL === */}
        {gallery.length > 0 && (
          <div className="relative h-64 w-full shrink-0 bg-black overflow-hidden">
            {/* Video override */}
            {business.video_url && gallery.length <= 1 ? (
              <iframe
                src={business.video_url}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={gallery[photoIdx]}
                  alt={`Фото ${photoIdx + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {gallery.length > 1 && (
                  <>
                    {/* Prev */}
                    <button
                      onClick={() => setPhotoIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition z-10"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {/* Next */}
                    <button
                      onClick={() => setPhotoIdx((i) => (i + 1) % gallery.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition z-10"
                    >
                      <ChevronRight size={18} />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {gallery.map((_: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIdx(i)}
                          className={`rounded-full transition-all ${i === photoIdx ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
                        />
                      ))}
                    </div>
                    {/* Counter */}
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      {photoIdx + 1}/{gallery.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* === CONTENT === */}
        <div className="p-6 overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter italic">{business.name}</h3>
          
          <p className="text-gray-500 text-sm mb-6 leading-relaxed font-medium">
            {business.about_text || business.description || "Добро пожаловать!"}
          </p>

          <div className="space-y-6">
            {/* SCHEDULE */}
            <div>
              <div className="flex items-center gap-2 mb-3 opacity-40">
                <Clock size={14} />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">График работы</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {DAY_KEYS.map((key, i) => {
                  const dayData = schedule[key];
                  const isClosed = dayData?.closed;
                  const isToday = i === todayIdx;
                  const hoursStr = formatHours(dayData);
                  return (
                    <div
                      key={key}
                      className={`py-2 rounded-xl border text-center transition-colors ${
                        isToday
                          ? "bg-black text-white border-black"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className={`text-[9px] font-bold mb-1 ${isToday ? "text-white/70" : "text-gray-400"}`}>
                        {DAY_SHORT[i]}
                      </div>
                      <div className={`text-[7.5px] font-black leading-tight ${isClosed ? "text-red-400" : isToday ? "text-white" : "text-gray-700"}`}>
                        {hoursStr}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ADDRESS */}
            {(business.address || business.about_address) && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <MapPin size={22} className="opacity-30 shrink-0" />
                <div>
                  <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Локация</div>
                  <div className="text-sm font-bold">{business.address || business.about_address}</div>
                </div>
              </div>
            )}

            {/* YANDEX MAP */}
            {business.show_yandex_map && business.yandex_map_link && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 h-48">
                <iframe
                  src={business.yandex_map_link}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
            )}

            {/* NAV BUTTON */}
            {(business.map_link || business.yandex_map_link) && (
              <a
                href={business.map_link || business.yandex_map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-black text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform uppercase tracking-widest text-sm"
              >
                Построить маршрут
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}