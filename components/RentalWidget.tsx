"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { X, Calendar, CheckCircle, Loader2, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RentalSpace {
  id?: string | number;
  name: string;
  price: number | string;
  description?: string;
  photo_url?: string;
  capacity?: number;
  is_active?: boolean;
}

interface RentalWidgetProps {
  spaces: RentalSpace[];
  businessName: string;
  pricePerHour?: boolean;
}

interface FormData {
  space: string;
  spaceId?: string | number;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  phone: string;
}

// Generate 30-min slots from 8:00 to 22:00
function genSlots(open = "08:00", close = "22:00") {
  const slots: string[] = [];
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  let cur = oh * 60 + om;
  const end = ch * 60 + cm;
  while (cur <= end) {
    const h = Math.floor(cur / 60).toString().padStart(2, "0");
    const m = (cur % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += 30;
  }
  return slots;
}

// Get week dates (Mon–Sun) for offset weeks
function getWeekDates(weekOffset = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

export default function RentalWidget({ spaces, businessName, pricePerHour = true }: RentalWidgetProps) {
  const emptyForm: FormData = { space: "", date: "", startTime: "", endTime: "", name: "", phone: "" };

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const activeSpaces = useMemo(() => spaces.filter((s) => s.is_active !== false), [spaces]);
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const allSlots = genSlots();

  const isPhoneValid = formData.phone.length >= 17;

  // Load booked slots for selected space + visible week
  useEffect(() => {
    if (!formData.space || !isOpen) return;
    const fetchBooked = async () => {
      const dateStrs = weekDates.map(d => d.toISOString().split("T")[0]);
      const { data } = await supabase
        .from("bookings")
        .select("booking_date, time")
        .in("booking_date", dateStrs)
        .ilike("service_name", `%${formData.space}%`)
        .neq("status", "cancelled");
      
      const map: Record<string, string[]> = {};
      data?.forEach((b: any) => {
        if (!map[b.booking_date]) map[b.booking_date] = [];
        map[b.booking_date].push(b.time);
      });
      setBookedSlots(map);
    };
    fetchBooked();
  }, [formData.space, weekOffset, isOpen]);

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

  const handleSlotSelect = (dateStr: string, slot: string) => {
    if (!formData.startTime || (formData.startTime && formData.endTime)) {
      setFormData((p) => ({ ...p, date: dateStr, startTime: slot, endTime: "" }));
    } else if (formData.date === dateStr && slot > formData.startTime) {
      setFormData((p) => ({ ...p, endTime: slot }));
    } else {
      setFormData((p) => ({ ...p, date: dateStr, startTime: slot, endTime: "" }));
    }
  };

  const isSlotSelected = (dateStr: string, slot: string) => {
    if (formData.date !== dateStr) return false;
    if (!formData.endTime) return formData.startTime === slot;
    return slot >= formData.startTime && slot <= formData.endTime;
  };

  const isSlotBooked = (dateStr: string, slot: string) => {
    return bookedSlots[dateStr]?.includes(slot) ?? false;
  };

  const isSlotPast = (dateStr: string, slot: string) => {
    const now = new Date();
    const slotDate = new Date(dateStr + "T" + slot);
    return slotDate < now;
  };

  const selectedSpace = activeSpaces.find(s => s.name === formData.space);

  const calcDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const [sh, sm] = formData.startTime.split(":").map(Number);
    const [eh, em] = formData.endTime.split(":").map(Number);
    return (eh * 60 + em - sh * 60 - sm) / 60;
  };

  const duration = calcDuration();
  const price = selectedSpace ? Number(selectedSpace.price) * duration : 0;

  const handleBook = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: businessName,
          service: `Аренда: ${formData.space}`,
          date: formData.date,
          time: `${formData.startTime} – ${formData.endTime}`,
          clientName: formData.name,
          clientPhone: formData.phone,
          notes: `Длительность: ${duration} ч, Сумма: ${price.toLocaleString("ru-RU")} ₽`,
        }),
      });
      setStep(4);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [formData, businessName, duration, price]);

  const closeAndReset = useCallback(() => {
    setIsOpen(false);
    setFormData(emptyForm);
    setStep(1);
    setWeekOffset(0);
  }, []);

  /* === COLLAPSED === */
  if (!isOpen) {
    return (
      <div className="space-y-3 w-full">
        <button onClick={() => { setIsOpen(true); setStep(1); }}
          className={`w-full h-16 rounded-2xl shadow-xl flex items-center justify-between px-6 font-bold transition-all active:scale-[0.98] ${formData.space ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}>
          <div className="flex items-center gap-3">
            <Home size={20} className={formData.space ? "opacity-70" : "opacity-40"} />
            <span className="text-base uppercase tracking-wide truncate max-w-[220px]">
              {formData.space || "Выбрать помещение"}
            </span>
          </div>
          {formData.space && <CheckCircle size={20} className="opacity-70 shrink-0" />}
        </button>

        <button onClick={() => { setIsOpen(true); setStep(2); }}
          className={`w-full h-16 rounded-2xl shadow-xl flex items-center justify-between px-6 font-bold transition-all active:scale-[0.98] ${formData.startTime && formData.endTime ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}>
          <div className="flex items-center gap-3">
            <Calendar size={20} className={formData.startTime ? "opacity-70" : "opacity-40"} />
            <span className="text-base uppercase tracking-wide truncate max-w-[220px]">
              {formData.startTime && formData.endTime ? `${formData.date} · ${formData.startTime}–${formData.endTime}` : "Выбрать время"}
            </span>
          </div>
          {formData.startTime && formData.endTime && <CheckCircle size={20} className="opacity-70 shrink-0" />}
        </button>

        {formData.space && formData.startTime && formData.endTime && (
          <button onClick={() => { setIsOpen(true); setStep(3); }}
            className="w-full h-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl shadow-xl flex items-center justify-center font-black text-lg uppercase tracking-widest active:scale-[0.98] transition-transform">
            Забронировать →
          </button>
        )}
      </div>
    );
  }

  /* === MODAL === */
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && step < 4 && (
              <button onClick={() => setStep(s => s - 1)} className="p-2 bg-gray-100 rounded-full">
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="text-xl font-black uppercase italic leading-none">
                {step === 1 && "Помещение"}
                {step === 2 && "Расписание"}
                {step === 3 && "Контакты"}
                {step === 4 && "Готово!"}
              </h3>
              {step < 4 && <p className="text-xs text-gray-400 mt-0.5">Шаг {step} из 3</p>}
            </div>
          </div>
          <button onClick={closeAndReset} className="p-2 bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        {step < 4 && (
          <div className="px-6 pb-4 shrink-0 flex gap-1.5">
            {[1,2,3].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-black" : "bg-gray-200"}`} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* STEP 1: SELECT SPACE */}
          {step === 1 && (
            <div className="space-y-3">
              {activeSpaces.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Home size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Нет доступных помещений</p>
                </div>
              )}
              {activeSpaces.map((space, idx) => {
                const sel = formData.space === space.name;
                return (
                  <button key={space.id ?? idx}
                    onClick={() => { setFormData(p => ({ ...p, space: space.name, spaceId: space.id })); setStep(2); }}
                    className={`w-full rounded-2xl border-2 text-left transition-all active:scale-[0.98] overflow-hidden ${sel ? "border-black" : "border-gray-100 hover:border-gray-300"}`}>
                    {space.photo_url && (
                      <div className="h-36 w-full overflow-hidden">
                        <img src={space.photo_url} alt={space.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={`p-4 ${sel ? "bg-black text-white" : "bg-gray-50"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{space.name}</p>
                          {space.capacity && <p className={`text-xs mt-0.5 ${sel ? "text-white/70" : "text-gray-400"}`}>До {space.capacity} чел.</p>}
                          {space.description && <p className={`text-xs mt-1 line-clamp-2 ${sel ? "text-white/60" : "text-gray-400"}`}>{space.description}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-black text-xl ${sel ? "text-white" : "text-black"}`}>{Number(space.price).toLocaleString("ru-RU")} ₽</p>
                          <p className={`text-xs ${sel ? "text-white/60" : "text-gray-400"}`}>/час</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: WEEK SCHEDULE */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Week navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setWeekOffset(o => Math.max(0, o - 1)); setFormData(p => ({ ...p, date: "", startTime: "", endTime: "" })); }}
                  disabled={weekOffset === 0}
                  className="p-2 rounded-full bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-bold">
                  {weekDates[0].toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} –{" "}
                  {weekDates[6].toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                </span>
                <button
                  onClick={() => { setWeekOffset(o => o + 1); setFormData(p => ({ ...p, date: "", startTime: "", endTime: "" })); }}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Instruction */}
              <div className="text-xs text-gray-500 text-center">
                Выберите начало, затем конец аренды (шаг 30 мин)
              </div>

              {/* Weekly grid - scrollable */}
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="flex gap-2 min-w-max">
                  {weekDates.map((date, di) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const isToday = dateStr === new Date().toISOString().split("T")[0];
                    const isPastDay = date < new Date(new Date().toDateString());
                    return (
                      <div key={dateStr} className="flex flex-col gap-1 min-w-[52px]">
                        {/* Day header */}
                        <div className={`text-center py-1.5 rounded-xl mb-1 ${isToday ? "bg-black text-white" : "bg-gray-50"}`}>
                          <div className={`text-[9px] font-bold ${isToday ? "text-white/70" : "text-gray-400"}`}>{DAY_NAMES[di]}</div>
                          <div className={`text-[11px] font-black ${isToday ? "text-white" : ""}`}>
                            {date.getDate()}
                          </div>
                        </div>
                        {/* Time slots */}
                        {allSlots.map((slot) => {
                          const booked = isSlotBooked(dateStr, slot);
                          const past = isSlotPast(dateStr, slot) || isPastDay;
                          const selected = isSlotSelected(dateStr, slot);
                          const isStart = formData.date === dateStr && formData.startTime === slot;
                          const isEnd = formData.date === dateStr && formData.endTime === slot;
                          return (
                            <button
                              key={slot}
                              disabled={booked || past}
                              onClick={() => handleSlotSelect(dateStr, slot)}
                              title={slot}
                              className={`h-7 w-full rounded-lg text-[9px] font-bold transition-all leading-none flex items-center justify-center ${
                                booked || past
                                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                  : isStart || isEnd
                                  ? "bg-black text-white"
                                  : selected
                                  ? "bg-black/20 text-black"
                                  : "bg-gray-50 hover:bg-gray-200 text-gray-600"
                              }`}
                            >
                              <span>{slot}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time legend */}
              <div className="flex gap-2 text-[10px] text-gray-400 justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-black inline-block"/>Выбрано</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-black/20 inline-block"/>Диапазон</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block"/>Занято</span>
              </div>

              {/* Selected range summary */}
              {formData.startTime && (
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Выбрано</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{formData.date}</p>
                      <p className="text-gray-500 text-sm">
                        {formData.startTime}
                        {formData.endTime ? ` – ${formData.endTime}` : " (выберите конец)"}
                      </p>
                      {duration > 0 && <p className="text-xs text-gray-400 mt-1">{duration} ч</p>}
                    </div>
                    {price > 0 && <p className="font-black text-2xl">{price.toLocaleString("ru-RU")} ₽</p>}
                  </div>
                </div>
              )}

              {formData.startTime && formData.endTime && (
                <button onClick={() => setStep(3)}
                  className="w-full h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest active:scale-[0.98] transition-transform">
                  Продолжить →
                </button>
              )}
            </div>
          )}

          {/* STEP 3: CONTACTS */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-3">Бронирование</p>
                {[
                  { label: "Помещение", value: formData.space },
                  { label: "Дата", value: formData.date },
                  { label: "Время", value: `${formData.startTime} – ${formData.endTime}` },
                  { label: "Длительность", value: `${duration} ч` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                  <span className="text-gray-500 text-sm">Итого</span>
                  <span className="font-black text-lg">{price.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Ваше имя</label>
                <input type="text" placeholder="Иван" value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold text-base transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Телефон</label>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={formData.phone} onChange={handlePhoneChange}
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold text-base transition-colors" />
              </div>
              <button onClick={handleBook} disabled={!formData.name.trim() || !isPhoneValid || loading}
                className="w-full h-14 bg-black disabled:bg-gray-300 text-white rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                {loading ? <><Loader2 size={20} className="animate-spin" />Отправляем...</> : "Забронировать"}
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-3">Забронировано!</h3>
              <p className="text-gray-500 text-sm mb-2">
                {formData.space} · {formData.date}
              </p>
              <p className="text-gray-500 text-sm mb-8">
                {formData.startTime} – {formData.endTime} · {price.toLocaleString("ru-RU")} ₽
              </p>
              <button onClick={closeAndReset} className="px-8 h-12 bg-black text-white rounded-2xl font-bold uppercase tracking-widest active:scale-95 transition-transform">
                Отлично!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}