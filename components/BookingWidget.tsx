"use client";

import { useState, useMemo, useCallback } from "react";
import {
  X,
  Calendar,
  User,
  Scissors,
  CheckCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface Service {
  id?: string | number;
  name: string;
  price: number | string;
  category?: string;
  duration_minutes?: number;
  description?: string;
  is_active?: boolean;
}

export interface Master {
  id?: string | number;
  name: string;
  photo_url?: string;
  specialization?: string;
  specialty?: string;
  bio?: string;
  is_active?: boolean;
}

export interface BookingWidgetProps {
  services: Service[];
  masters: Master[];
  businessName: string;
}

interface FormData {
  service: string;
  price: string;
  master: string;
  date: string;
  time: string;
  name: string;
  phone: string;
}

export default function BookingWidget({ services, masters, businessName }: BookingWidgetProps) {
  const emptyForm: FormData = { service: "", price: "", master: "", date: "", time: "", name: "", phone: "" };

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const activeServices = useMemo(() => services.filter((s) => s.is_active !== false), [services]);
  const activeMasters = useMemo(() => masters.filter((m) => m.is_active !== false), [masters]);

  const groupedServices = useMemo(() => {
    return activeServices.reduce<Record<string, Service[]>>((acc, s) => {
      const cat = s.category || "Услуги";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {});
  }, [activeServices]);

  const dates = useMemo(() => {
    const result: { label: string; dayNum: string; value: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        label: d.toLocaleDateString("ru-RU", { weekday: "short" }),
        dayNum: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
        value: d.toISOString().split("T")[0],
      });
    }
    return result;
  }, []);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 9; h < 21; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    slots.push("21:00");
    return slots;
  }, []);

  const isPhoneValid = formData.phone.length >= 17;

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.startsWith("7") || input.startsWith("8")) input = input.slice(1);
    if (input.length > 10) input = input.slice(0, 10);
    let f = "";
    if (input.length > 0) f = "+7";
    if (input.length > 0) f += " (" + input.slice(0, 3);
    if (input.length >= 4) f += ") " + input.slice(3, 6);
    if (input.length >= 7) f += "-" + input.slice(6, 8);
    if (input.length >= 9) f += "-" + input.slice(8, 10);
    setFormData((p) => ({ ...p, phone: f }));
  }, []);

  const handleDateSelect = useCallback(async (date: string) => {
    setFormData((p) => ({ ...p, date, time: "" }));
    const { data, error } = await supabase
      .from("bookings").select("time")
      .eq("business_slug", businessName)
      .eq("booking_date", date)
      .eq("master_name", formData.master)
      .neq("status", "cancelled");
    if (!error && data) setBookedTimes(data.map((b: any) => b.time));
  }, [formData.master, businessName]);

  const handleBook = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: businessName,
          service: `${formData.service} (${formData.price} ₽)`,
          master: formData.master,
          date: formData.date,
          time: formData.time,
          clientName: formData.name,
          clientPhone: formData.phone,
        }),
      });
      // Блокируем время локально сразу после бронирования
      setBookedTimes(prev => [...prev, formData.time]);
      setStep(5);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [formData, businessName]);

  const closeAndReset = useCallback(() => {
    setIsOpen(false);
    setFormData(emptyForm);
    setStep(1);
    setBookedTimes([]);
  }, []);

  /* === COLLAPSED === */
  if (!isOpen) {
    const navBtns = [
      { id: 1, icon: Scissors, text: formData.service || "Выбрать услугу", done: !!formData.service },
      { id: 2, icon: User, text: formData.master || "Выбрать мастера", done: !!formData.master },
      { id: 3, icon: Calendar, text: formData.date && formData.time ? `${formData.date} · ${formData.time}` : "Выбрать время", done: !!(formData.date && formData.time) },
    ];
    return (
      <div className="space-y-3 w-full">
        {navBtns.map((btn) => (
          <button key={btn.id} onClick={() => { setIsOpen(true); setStep(btn.id); }}
            className={`w-full h-16 rounded-2xl shadow-xl flex items-center justify-between px-6 font-bold transition-all active:scale-[0.98] ${btn.done ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}>
            <div className="flex items-center gap-3">
              <btn.icon size={20} className={btn.done ? "opacity-70" : "opacity-40"} />
              <span className="text-base uppercase tracking-wide truncate max-w-[220px]">{btn.text}</span>
            </div>
            {btn.done && <CheckCircle size={20} className="opacity-70 shrink-0" />}
          </button>
        ))}
        {formData.service && formData.master && formData.date && formData.time && (
          <button onClick={() => { setIsOpen(true); setStep(4); }}
            className="w-full h-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl shadow-xl flex items-center justify-center font-black text-lg uppercase tracking-widest active:scale-[0.98] transition-transform">
            Записаться →
          </button>
        )}
      </div>
    );
  }

  /* === MODAL === */
  const stepTitles = ["", "Услуга", "Мастер", "Дата и время", "Контакты", "Готово!"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && step < 5 && (
              <button onClick={() => {
                if (step === 2) setFormData(p => ({ ...p, master: "" }));
                if (step === 3) setFormData(p => ({ ...p, date: "", time: "" }));
                if (step === 4) setFormData(p => ({ ...p, name: "", phone: "" }));
                setStep(s => s - 1);
              }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="text-xl font-black uppercase italic leading-none">{stepTitles[step]}</h3>
              {step < 5 && <p className="text-xs text-gray-400 mt-0.5">Шаг {step} из 4</p>}
            </div>
          </div>
          <button onClick={closeAndReset} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        {step < 5 && (
          <div className="px-6 pb-4 shrink-0 flex gap-1.5">
            {[1,2,3,4].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-black" : "bg-gray-200"}`} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* STEP 1: SERVICES */}
          {step === 1 && (
            <div className="space-y-4">
              {Object.keys(groupedServices).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Scissors size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Нет доступных услуг</p>
                </div>
              )}
              {Object.entries(groupedServices).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{cat}</p>
                  <div className="space-y-2">
                    {items.map((s, idx) => {
                      const sel = formData.service === s.name;
                      return (
                        <button key={s.id ?? idx}
                          onClick={() => { setFormData((p) => ({ ...p, service: s.name, price: String(s.price) })); setStep(2); }}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${sel ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{s.name}</p>
                              {s.description && <p className={`text-xs mt-0.5 line-clamp-1 ${sel ? "text-white/70" : "text-gray-400"}`}>{s.description}</p>}
                              {s.duration_minutes && <p className={`text-xs mt-0.5 ${sel ? "text-white/60" : "text-gray-400"}`}>⏱ {s.duration_minutes} мин</p>}
                            </div>
                            <span className={`font-black text-lg shrink-0 ${sel ? "text-white" : "text-black"}`}>
                              {Number(s.price).toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: MASTERS */}
          {step === 2 && (
            <div className="space-y-3">
              {activeMasters.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <User size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Нет доступных мастеров</p>
                </div>
              )}
              {/* Any master */}
              {activeMasters.length > 0 && (
                <button onClick={() => { setFormData((p) => ({ ...p, master: "Любой мастер" })); setStep(3); }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${formData.master === "Любой мастер" ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center shrink-0">
                      <User size={24} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-bold">Любой мастер</p>
                      <p className={`text-xs mt-0.5 ${formData.master === "Любой мастер" ? "text-white/70" : "text-gray-400"}`}>Ближайшее свободное время</p>
                    </div>
                  </div>
                </button>
              )}
              {activeMasters.map((m, idx) => {
                const sel = formData.master === m.name;
                return (
                  <button key={m.id ?? idx}
                    onClick={() => { setFormData((p) => ({ ...p, master: m.name })); setStep(3); }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${sel ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-gray-200">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl font-black text-gray-500">{m.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{m.name}</p>
                        {(m.specialization || m.specialty) && (
                          <p className={`text-xs mt-0.5 ${sel ? "text-white/70" : "text-gray-500"}`}>{m.specialization || m.specialty}</p>
                        )}
                        {m.bio && (
                          <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${sel ? "text-white/60" : "text-gray-400"}`}>{m.bio}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 3: DATE + TIME */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Дата</p>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                  {dates.map((d) => {
                    const sel = formData.date === d.value;
                    return (
                      <button key={d.value} onClick={() => handleDateSelect(d.value)}
                        className={`flex flex-col items-center justify-center min-w-[60px] h-[68px] rounded-2xl border-2 transition-all shrink-0 active:scale-95 ${sel ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                        <span className={`text-[10px] uppercase font-bold ${sel ? "text-white/70" : "text-gray-400"}`}>{d.label}</span>
                        <span className="text-xs font-black mt-0.5">{d.dayNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {formData.date ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Время</p>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => {
                        const booked = bookedTimes.includes(slot);
                        const sel = formData.time === slot;
                        return (
                          <button key={slot} disabled={booked} onClick={() => setFormData((p) => ({ ...p, time: slot }))}
                            className={`h-11 rounded-xl border-2 text-sm font-bold transition-all active:scale-95 ${booked ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through" : sel ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {formData.time && (
                    <button onClick={() => setStep(4)}
                      className="w-full h-14 bg-black text-white rounded-2xl font-bold text-base uppercase tracking-widest active:scale-[0.98] transition-transform flex items-center justify-center">
                      Продолжить →
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calendar size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Выберите дату выше</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CONTACTS */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-3">Ваш заказ</p>
                {[
                  { label: "Услуга", value: formData.service },
                  { label: "Мастер", value: formData.master },
                  { label: "Дата и время", value: `${formData.date} · ${formData.time}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-bold text-right">{value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                  <span className="text-gray-500 text-sm">Итого</span>
                  <span className="font-black text-lg">{Number(formData.price).toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Ваше имя</label>
                <input type="text" placeholder="Иван" value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold text-base transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Телефон</label>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={formData.phone} onChange={handlePhoneChange}
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold text-base transition-colors" />
              </div>
              <button onClick={handleBook} disabled={!formData.name.trim() || !isPhoneValid || loading}
                className="w-full h-14 bg-black disabled:bg-gray-300 text-white rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                {loading ? <><Loader2 size={20} className="animate-spin" /> Отправляем...</> : "Записаться"}
              </button>
              <p className="text-center text-xs text-gray-400">Нажимая кнопку, вы соглашаетесь с условиями обработки данных</p>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-3">Запись создана!</h3>
              <p className="text-gray-500 text-sm mb-2">Ждём вас <strong>{formData.date} в {formData.time}</strong></p>
              <p className="text-gray-400 text-xs mb-8">Мы свяжемся с вами по номеру {formData.phone}</p>
              <button onClick={closeAndReset}
                className="px-8 h-12 bg-black text-white rounded-2xl font-bold uppercase tracking-widest active:scale-95 transition-transform">
                Отлично!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}