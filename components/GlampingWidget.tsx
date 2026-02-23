"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Loader2, Plus, Minus, CheckCircle, LayoutGrid, Receipt } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface GlampingWidgetProps {
  houses: any[];
  addons: any[];
  businessName: string;
  managerTelegram?: string;
}

const MONTH_NAMES = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

export default function GlampingWidget({ houses, addons, businessName, managerTelegram }: GlampingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Детальный просмотр дома
  const [houseDetail, setHouseDetail] = useState<any>(null);
  const [detailPhotoIdx, setDetailPhotoIdx] = useState(0);

  // Детальный просмотр допуслуги
  const [addonDetail, setAddonDetail] = useState<any>(null);
  const [addonPhotoIdx, setAddonPhotoIdx] = useState(0);

  const initialBooking = {
    house: null as any,
    startDate: null as Date | null,
    endDate: null as Date | null,
    selectedAddons: {} as Record<string, number>,
    clientName: "",
    clientPhone: "",
  };
  const [booking, setBooking] = useState({ ...initialBooking });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // ── helpers ──────────────────────────────────────────────
  const fmt = (d: Date) => d.toLocaleDateString("ru-RU");
  const nights = booking.startDate && booking.endDate
    ? Math.max(1, Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / 86400000))
    : 0;
  const houseTotal = booking.house ? parseInt(booking.house.price) * nights : 0;
  const addonsTotal = addons.reduce((s, a) => s + (booking.selectedAddons[a.name] || 0) * Number(a.price), 0);
  const total = houseTotal + addonsTotal;
  const deposit = Math.round(total * 0.3);

  const { days, offset, year, month } = (() => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const d = new Date(y, m + 1, 0).getDate();
    const f = new Date(y, m, 1).getDay();
    return { days: d, offset: f === 0 ? 6 : f - 1, year: y, month: m };
  })();

  // ── fetch blocked dates ──────────────────────────────────
  useEffect(() => {
    if (!booking.house) return;
    supabase.from("bookings").select("booking_date")
      .eq("business_slug", businessName)
      .ilike("service_name", `%${booking.house.name}%`)
      .neq("status", "cancelled")
      .then(({ data }) => {
        const busy: string[] = [];
        data?.forEach((row: any) => {
          if (!row.booking_date?.includes("—")) return;
          const [ss, es] = row.booking_date.split(" — ");
          const parse = (s: string) => { const p = s.split("."); return new Date(`${p[2]}-${p[1]}-${p[0]}`); };
          const start = parse(ss), end = parse(es);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1))
            busy.push(d.toISOString().split("T")[0]);
        });
        setBlockedDates(busy);
      });
  }, [booking.house]);

  // ── phone mask ───────────────────────────────────────────
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.startsWith("7") || v.startsWith("8")) v = v.slice(1);
    if (v.length > 10) v = v.slice(0, 10);
    let f = v.length > 0 ? "+7" : "";
    if (v.length > 0) f += " (" + v.slice(0, 3);
    if (v.length >= 4) f += ") " + v.slice(3, 6);
    if (v.length >= 7) f += "-" + v.slice(6, 8);
    if (v.length >= 9) f += "-" + v.slice(8, 10);
    setBooking(p => ({ ...p, clientPhone: f }));
  };
  const phoneValid = booking.clientPhone.length === 18;

  // ── date click ───────────────────────────────────────────
  const handleDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    const clicked = new Date(year, month, day);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    if (clicked < now || blockedDates.includes(dateStr)) return;
    if (!booking.startDate || (booking.startDate && booking.endDate)) {
      setBooking(p => ({ ...p, startDate: clicked, endDate: null }));
    } else if (clicked > booking.startDate) {
      let valid = true;
      for (let d = new Date(booking.startDate); d <= clicked; d.setDate(d.getDate() + 1))
        if (blockedDates.includes(d.toISOString().split("T")[0])) valid = false;
      if (valid) setBooking(p => ({ ...p, endDate: clicked }));
      else alert("Выбранный период занят!");
    } else {
      setBooking(p => ({ ...p, startDate: clicked, endDate: null }));
    }
  };

  // ── back logic: clear step data ──────────────────────────
  const back = () => {
    if (step === 2) {
      // back to house select → clear dates
      setBooking(p => ({ ...p, startDate: null, endDate: null }));
    }
    if (step === 3) {
      // back to date select → clear addons
      setBooking(p => ({ ...p, selectedAddons: {} }));
    }
    if (step === 4) {
      // back to addons → clear contacts
      setBooking(p => ({ ...p, clientName: "", clientPhone: "" }));
    }
    setStep(s => s - 1);
  };

  // ── book ─────────────────────────────────────────────────
  const handleBook = async () => {
    setLoading(true);
    const addonsText = Object.entries(booking.selectedAddons)
      .filter(([, c]) => c > 0).map(([n, c]) => `${n} x${c}`).join(", ");
    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: businessName,
          clientName: booking.clientName,
          clientPhone: booking.clientPhone,
          service: `🏡 ${booking.house.name}`,
          master: addonsText || "Без допуслуг",
          date: `${fmt(booking.startDate!)} — ${fmt(booking.endDate!)}`,
          time: `Итого: ${total}₽ (предоплата ${deposit}₽)`,
        }),
      });

      // Блокируем даты локально сразу после бронирования
      const newBlocked: string[] = [];
      for (let d = new Date(booking.startDate!); d <= booking.endDate!; d.setDate(d.getDate() + 1))
        newBlocked.push(d.toISOString().split("T")[0]);
      setBlockedDates(prev => [...prev, ...newBlocked]);

    } catch (e) { console.error(e); }
    setLoading(false);

    // Открываем TG с менеджером (только username, не chat_id)
    // managerTelegram должен быть username (без @), например "ivan_manager"
    const rawTg = managerTelegram?.replace("@", "").trim() || "";
    // Если это числовой chat_id — не подходит для ссылки, используем дефолт
    const tg = rawTg && !/^-?\d+$/.test(rawTg) ? rawTg : "linkalink_notify_bot";
    const msg = `Здравствуйте! Хочу забронировать: ${booking.house.name}, ${fmt(booking.startDate!)} – ${fmt(booking.endDate!)}.${addonsText ? " Допуслуги: " + addonsText + "." : ""} Итого: ${total}₽, предоплата ${deposit}₽. Меня зовут ${booking.clientName}, тел: ${booking.clientPhone}.`;
    window.open(`https://t.me/${tg}?text=${encodeURIComponent(msg)}`, "_blank");

    setStep(5);
  };

  // ── reset ────────────────────────────────────────────────
  const reset = () => {
    setIsOpen(false);
    setStep(1);
    setBooking({ ...initialBooking });
    setHouseDetail(null);
    setAddonDetail(null);
  };

  // ── collapsed ────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="w-full h-16 bg-white text-black rounded-2xl shadow-xl flex items-center justify-center relative font-bold hover:bg-gray-50 transition-all active:scale-[0.98] mt-4">
        <span className="text-lg tracking-[0.2em] uppercase">Выбрать дом</span>
        <LayoutGrid size={20} className="absolute right-6 opacity-40" />
      </button>
    );
  }

  // ── modal ────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full max-w-[480px] h-full sm:h-[90vh] sm:rounded-[40px] relative text-slate-900 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-6 flex items-center justify-between bg-white z-10 border-b border-gray-100 shrink-0">
          {step > 1 && step < 5 && !addonDetail && (
            <button onClick={back} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
          )}
          {addonDetail && (
            <button onClick={() => setAddonDetail(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
          )}
          {!(step > 1 && step < 5) && !addonDetail && <div />}
          <span className="font-bold uppercase tracking-widest text-xs text-gray-400">
            {addonDetail ? "Подробнее" : ["","Выбор дома","Даты","Доп. услуги","Детали",""][step]}
          </span>
          <button onClick={reset} className="p-2 -mr-2 rounded-full hover:bg-gray-100"><X /></button>
        </div>

        {/* Steps indicator */}
        {step < 5 && !addonDetail && (
          <div className="px-6 py-2 flex gap-1.5 shrink-0">
            {[1,2,3,4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-black" : "bg-gray-200"}`} />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-gray-50">

          {/* ═══ ADDON DETAIL POPUP ════════════════════════════ */}
          {addonDetail && (() => {
            const photos: string[] = addonDetail.photos?.length > 0 ? addonDetail.photos : [];
            return (
              <div className="bg-white flex flex-col min-h-full">
                {photos.length > 0 && (
                  <div className="relative h-56 bg-gray-100 shrink-0">
                    <img src={photos[addonPhotoIdx]} alt={addonDetail.name} className="w-full h-full object-cover" />
                    {photos.length > 1 && (
                      <>
                        <button onClick={() => setAddonPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow">
                          <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => setAddonPhotoIdx(i => (i + 1) % photos.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow">
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {photos.map((_: any, idx: number) => (
                            <button key={idx} onClick={() => setAddonPhotoIdx(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${idx === addonPhotoIdx ? "bg-white" : "bg-white/40"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {addonDetail.video_url && (
                  <div className="h-44 shrink-0">
                    <iframe src={addonDetail.video_url} className="w-full h-full" allowFullScreen />
                  </div>
                )}
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{addonDetail.name}</h3>
                    {Number(addonDetail.price) > 0 && (
                      <span className="font-black text-xl shrink-0">{Number(addonDetail.price).toLocaleString("ru-RU")} ₽</span>
                    )}
                  </div>
                  {addonDetail.description && <p className="text-gray-600 text-sm leading-relaxed">{addonDetail.description}</p>}
                </div>
                <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 flex gap-3">
                  <button onClick={() => setAddonDetail(null)}
                    className="flex-1 py-4 rounded-2xl border-2 border-gray-200 font-bold text-sm text-center">
                    Не нужно
                  </button>
                  <button
                    onClick={() => {
                      setBooking(p => ({ ...p, selectedAddons: { ...p.selectedAddons, [addonDetail.name]: (p.selectedAddons[addonDetail.name] || 0) + 1 } }));
                      setAddonDetail(null);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-black text-white font-bold text-sm text-center">
                    Добавить
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ═══ STEP 1: HOUSE LIST ════════════════════════════ */}
          {step === 1 && !addonDetail && !houseDetail && (
            <div className="p-6 space-y-6">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Наши дома</h3>
              {houses.filter((h: any) => h.is_active !== false).map((house: any) => {
                const cover = house.photo_url || house.cover || house.image;
                return (
                  <div key={house.id}
                    onClick={() => {
                      if (house.show_details) { setHouseDetail(house); setDetailPhotoIdx(0); }
                      else { setBooking(p => ({ ...p, house })); setStep(2); }
                    }}
                    className="bg-white rounded-[32px] overflow-hidden shadow-lg cursor-pointer group hover:scale-[1.02] transition-transform">
                    <div className="h-60 relative overflow-hidden">
                      {cover
                        ? <img src={cover} alt={house.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl">🏠</div>
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-20">
                        <h4 className="text-white font-black text-2xl uppercase leading-tight">{house.name}</h4>
                        {house.show_details && <p className="text-white/70 text-xs mt-1">Нажмите, чтобы узнать подробнее →</p>}
                      </div>
                      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-1 rounded-xl font-black text-sm">
                        {house.price} ₽<span className="font-normal text-gray-500 text-xs">/ночь</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* HOUSE DETAIL */}
          {step === 1 && houseDetail && !addonDetail && (() => {
            const photos: string[] = houseDetail.photos?.length > 0 ? houseDetail.photos : houseDetail.photo_url ? [houseDetail.photo_url] : [];
            const features: string[] = houseDetail.features ? houseDetail.features.split("\n").map((f: string) => f.trim()).filter(Boolean) : [];
            return (
              <div className="bg-white flex flex-col min-h-full">
                {photos.length > 0 && (
                  <div className="relative h-64 bg-gray-100 shrink-0">
                    <img src={photos[detailPhotoIdx]} alt={houseDetail.name} className="w-full h-full object-cover" />
                    {photos.length > 1 && (
                      <>
                        <button onClick={() => setDetailPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow"><ChevronLeft size={18} /></button>
                        <button onClick={() => setDetailPhotoIdx(i => (i + 1) % photos.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow"><ChevronRight size={18} /></button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {photos.map((_: any, i: number) => <button key={i} onClick={() => setDetailPhotoIdx(i)} className={`w-2 h-2 rounded-full ${i === detailPhotoIdx ? "bg-white" : "bg-white/40"}`} />)}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="p-6 flex-1 space-y-5">
                  <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">{houseDetail.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black">{houseDetail.price} ₽</span>
                      <span className="text-gray-400 text-sm">/ ночь</span>
                    </div>
                  </div>
                  {houseDetail.description && <p className="text-gray-600 text-sm leading-relaxed">{houseDetail.description}</p>}
                  {features.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Удобства</p>
                      <div className="grid grid-cols-2 gap-2">
                        {features.map((f: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="text-green-500 font-bold shrink-0">✓</span><span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 flex gap-3">
                  <button onClick={() => setHouseDetail(null)} className="px-5 py-4 rounded-2xl border-2 border-gray-200 font-bold text-sm text-center">← Назад</button>
                  <button onClick={() => { setBooking(p => ({ ...p, house: houseDetail })); setHouseDetail(null); setStep(2); }}
                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-center">
                    Забронировать
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ═══ STEP 2: DATES ═════════════════════════════════ */}
          {step === 2 && !addonDetail && (
            <div className="flex flex-col h-full bg-white p-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Выберите даты</h3>
              <div className="bg-gray-50 p-4 rounded-[30px] mb-4">
                <div className="flex justify-between items-center mb-4 px-2">
                  <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 bg-white rounded-full shadow-sm"><ChevronLeft size={16}/></button>
                  <span className="font-bold uppercase text-sm">{MONTH_NAMES[month]} {year}</span>
                  <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 bg-white rounded-full shadow-sm"><ChevronRight size={16}/></button>
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-gray-400 font-bold mb-2">
                  {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: days }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
                    const blocked = blockedDates.includes(dateStr);
                    const isSel = booking.startDate?.getDate() === day && booking.startDate?.getMonth() === month
                      || booking.endDate?.getDate() === day && booking.endDate?.getMonth() === month;
                    const inRange = booking.startDate && booking.endDate
                      && new Date(year, month, day) > booking.startDate
                      && new Date(year, month, day) < booking.endDate;
                    const isPast = new Date(year, month, day) < (() => { const n = new Date(); n.setHours(0,0,0,0); return n; })();
                    return (
                      <button key={day} disabled={blocked || isPast} onClick={() => handleDate(day)}
                        className={`h-10 w-10 mx-auto rounded-full text-xs font-bold transition-all ${
                          blocked ? "text-gray-300 line-through cursor-not-allowed"
                          : isPast ? "text-gray-300 cursor-not-allowed"
                          : isSel ? "bg-black text-white"
                          : inRange ? "bg-gray-200 text-black"
                          : "hover:bg-gray-100 text-gray-800"
                        }`}>{day}</button>
                    );
                  })}
                </div>
              </div>
              {booking.startDate && (
                <div className="px-4 py-3 bg-gray-50 rounded-2xl text-sm mb-4 flex justify-between">
                  <span className="text-gray-500">Выбрано:</span>
                  <span className="font-bold">
                    {fmt(booking.startDate)}{booking.endDate ? ` — ${fmt(booking.endDate)}` : " → выберите конец"}
                  </span>
                </div>
              )}
              <button disabled={!booking.startDate || !booking.endDate} onClick={() => setStep(3)}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-widest disabled:opacity-40 text-center">
                Выбрать даты ({nights > 0 ? `${nights} ноч.` : "..."})
              </button>
            </div>
          )}

          {/* ═══ STEP 3: ADDONS ════════════════════════════════ */}
          {step === 3 && !addonDetail && (
            <div className="p-6 flex flex-col gap-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Дополнительно</h3>
              {addons.filter((a: any) => a.is_active !== false).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Нет дополнительных услуг</p>
              ) : (
                addons.filter((a: any) => a.is_active !== false).map((addon: any, i: number) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{addon.name}</p>
                        {addon.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{addon.description}</p>}
                        <p className="text-sm font-black mt-1">{Number(addon.price).toLocaleString("ru-RU")} ₽</p>
                        {addon.show_details && (
                          <button onClick={() => { setAddonDetail(addon); setAddonPhotoIdx(0); }}
                            className="mt-2 text-xs font-bold text-black underline text-left">
                            Узнать подробнее →
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => setBooking(p => ({ ...p, selectedAddons: { ...p.selectedAddons, [addon.name]: Math.max(0, (p.selectedAddons[addon.name] || 0) - 1) } }))}
                          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold">
                          <Minus size={14} />
                        </button>
                        <span className="font-black w-5 text-center">{booking.selectedAddons[addon.name] || 0}</span>
                        <button onClick={() => setBooking(p => ({ ...p, selectedAddons: { ...p.selectedAddons, [addon.name]: (p.selectedAddons[addon.name] || 0) + 1 } }))}
                          className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <button onClick={() => setStep(4)}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-widest mt-2 text-center">
                Продолжить →
              </button>
            </div>
          )}

          {/* ═══ STEP 4: CONTACTS + RECEIPT ════════════════════ */}
          {step === 4 && !addonDetail && (
            <div className="p-6 flex flex-col gap-5">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Ваши данные</h3>

              {/* Receipt */}
              <div className="bg-white rounded-[24px] border border-dashed border-gray-300 overflow-hidden shadow-sm">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                    <Receipt size={12} /> Ваш заказ
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-sm">{booking.house?.name}</span>
                    <span className="text-sm">{houseTotal.toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {fmt(booking.startDate!)} — {fmt(booking.endDate!)} · {nights} ноч.
                  </div>
                  {Object.entries(booking.selectedAddons).filter(([, c]) => c > 0).map(([n, c]) => {
                    const a = addons.find((x: any) => x.name === n);
                    return a ? (
                      <div key={n} className="flex justify-between text-sm text-gray-600">
                        <span>{n} ×{c}</span>
                        <span>{(Number(a.price) * (c as number)).toLocaleString("ru-RU")} ₽</span>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-lg">
                    <span>Итого</span><span>{total.toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <div className="bg-gray-900 text-white rounded-xl p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">Предоплата (30%)</p>
                    <p className="text-2xl font-black">{deposit.toLocaleString("ru-RU")} ₽</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Ваше имя</label>
                <input type="text" placeholder="Иван" value={booking.clientName}
                  onChange={e => setBooking(p => ({ ...p, clientName: e.target.value }))}
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold text-base transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Телефон</label>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={booking.clientPhone} onChange={handlePhone}
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold text-base transition-colors" />
              </div>

              <button disabled={!booking.clientName.trim() || !phoneValid || loading} onClick={handleBook}
                className="w-full h-14 bg-green-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                {loading ? <Loader2 size={20} className="animate-spin" /> : "💬 Связаться для оплаты"}
              </button>
              <p className="text-center text-xs text-gray-400">Мы откроем Telegram с менеджером, выбранные даты будут закреплены</p>
            </div>
          )}

          {/* ═══ STEP 5: SUCCESS ═══════════════════════════════ */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle size={44} className="text-green-500" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Заявка создана!</h3>
              <p className="text-gray-500 font-medium text-sm max-w-[260px]">
                Telegram открылся с менеджером. Завершите оплату там — и бронь будет подтверждена.
              </p>
              <button onClick={reset} className="mt-6 px-8 h-12 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-center">
                Готово
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}