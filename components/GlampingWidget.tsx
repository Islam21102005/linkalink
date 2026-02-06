"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Loader2, Plus, Minus, CheckCircle, Users, LayoutGrid, Receipt } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface GlampingWidgetProps {
  houses: any[];
  addons: any[];
  businessName: string;
  managerTelegram?: string;
}

export default function GlampingWidget({ houses, addons, businessName, managerTelegram }: GlampingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const initialBooking = {
    house: null,
    startDate: null,
    endDate: null,
    guests: 2,
    selectedAddons: {} as Record<string, number>,
    clientName: "",
    clientPhone: ""
  };
  const [booking, setBooking] = useState<any>(initialBooking);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const reset = () => {
    setIsOpen(false);
    setStep(1);
    setBooking(initialBooking);
  };

  const back = () => {
    if (step === 3) setBooking((prev: any) => ({ ...prev, startDate: null, endDate: null }));
    setStep(step - 1);
  };

  useEffect(() => {
    if (booking.house) {
      const fetchBookings = async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_date')
          .ilike('service_name', `%${booking.house.name}%`)
          .neq('status', 'cancelled');

        if (error) {
          console.error("Ошибка загрузки дат:", error);
          return;
        }

        const busy: string[] = [];

        data?.forEach((row: any) => {
            if (!row.booking_date || !row.booking_date.includes("—")) return;
            
            const [startStr, endStr] = row.booking_date.split(" — ");
            
            const parseDate = (s: string) => {
                const parts = s.split(".");
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            };

            const start = parseDate(startStr);
            const end = parseDate(endStr);

            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                busy.push(d.toISOString().split('T')[0]);
            }
            busy.push(end.toISOString().split('T')[0]);
        });

        setBlockedDates(busy);
      };
      fetchBookings();
    }
  }, [booking.house]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.startsWith("7") || input.startsWith("8")) input = input.slice(1);
    if (input.length > 10) input = input.slice(0, 10);
    let f = "";
    if (input.length > 0) f = "+7";
    if (input.length > 0) f += " (" + input.slice(0, 3);
    if (input.length >= 4) f += ") " + input.slice(3, 6);
    if (input.length >= 7) f += "-" + input.slice(6, 8);
    if (input.length >= 9) f += "-" + input.slice(8, 10);
    setBooking({ ...booking, clientPhone: f });
  };

  const isPhoneValid = booking.clientPhone.length === 18;

  const { days, offset, year, month } = (() => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const d = new Date(y, m + 1, 0).getDate();
    const f = new Date(y, m, 1).getDay();
    return { days: d, offset: f === 0 ? 6 : f - 1, year: y, month: m };
  })();
  
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  const handleDateClick = (day: number) => {
    const dateStr = new Date(year, month, day + 1).toISOString().split('T')[0];
    const clickedDate = new Date(year, month, day);
    const now = new Date(); now.setHours(0,0,0,0);
    
    if (clickedDate < now || blockedDates.includes(dateStr)) return;

    if (!booking.startDate || (booking.startDate && booking.endDate)) {
      setBooking({ ...booking, startDate: clickedDate, endDate: null });
    } else {
      if (clickedDate > booking.startDate) {
        let valid = true;
        for (let d = new Date(booking.startDate); d <= clickedDate; d.setDate(d.getDate() + 1)) {
             if (blockedDates.includes(d.toISOString().split('T')[0])) valid = false;
        }
        if (valid) setBooking({ ...booking, endDate: clickedDate });
        else alert("Выбранный период занят!");
      } else {
        setBooking({ ...booking, startDate: clickedDate, endDate: null });
      }
    }
  };

  const calculateTotal = () => {
    if (!booking.house || !booking.startDate || !booking.endDate) return 0;
    const nights = Math.max(1, Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)));
    let total = parseInt(booking.house.price) * nights;
    addons.forEach(a => total += (booking.selectedAddons[a.name] || 0) * a.price);
    return total;
  };

  const total = calculateTotal();
  const deposit = Math.round(total * 0.3);

  const handleBookingRequest = async () => {
    setLoading(true);
    const formatDate = (d: Date) => d.toLocaleDateString('ru-RU');
    
    const addonsText = Object.entries(booking.selectedAddons)
        .filter(([_, c]: any) => c > 0)
        .map(([n, c]) => `${n} x${c}`).join(", ");

    console.log("🏕 Отправка заявки глэмпинга:", { businessName });

    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: businessName, // Передаем slug бизнеса
          clientName: booking.clientName,
          clientPhone: booking.clientPhone,
          service: `🏡 ${booking.house.name}`,
          master: `Допы: ${addonsText || "Нет"}`,
          date: `${formatDate(booking.startDate)} — ${formatDate(booking.endDate)}`,
          time: `Сумма: ${total}₽ (Предоплата ${deposit}₽)`
        }),
      });

      console.log("✅ Заявка глэмпинга отправлена");
    } catch (error) {
      console.error("❌ Ошибка отправки заявки глэмпинга:", error);
    }

    setLoading(false);
    
    const targetTg = managerTelegram || "bazzlayter00"; 
    const message = `Здравствуйте! Я хочу оплатить бронь: ${booking.house.name}, ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}. Сумма: ${total}₽`;
    window.open(`https://t.me/${targetTg}?text=${encodeURIComponent(message)}`, '_blank');
    
    setStep(6);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="w-full h-16 bg-white text-black rounded-2xl shadow-xl flex items-center justify-center relative font-bold hover:bg-gray-50 transition-all active:scale-[0.98] mt-4">
        <span className="text-lg tracking-[0.2em] uppercase">ВЫБРАТЬ ДОМ</span>
        <LayoutGrid size={20} className="absolute right-6 opacity-40" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-[480px] h-full sm:h-[90vh] sm:rounded-[40px] relative text-slate-900 shadow-2xl flex flex-col overflow-hidden">
        
        <div className="p-6 flex items-center justify-between bg-white z-10 border-b border-gray-100">
            {step > 1 && step < 6 && <button onClick={back} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>}
            <span className="font-bold uppercase tracking-widest text-xs opacity-50">Бронирование</span>
            <button onClick={reset} className="p-2 -mr-2 rounded-full hover:bg-gray-100"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 pb-20">
            
            {step === 1 && (
                <div className="p-6 space-y-6">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">Наши дома</h3>
                    {houses.map((house) => (
                        <div key={house.id} onClick={() => { setBooking({...booking, house}); setStep(2); }} className="bg-white rounded-[32px] overflow-hidden shadow-lg cursor-pointer group hover:scale-[1.02] transition-transform">
                            <div className="h-64 relative overflow-hidden">
                                <img 
                                  src={house.cover || house.image} 
                                  alt={house.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h4 className="text-white font-black text-2xl uppercase tracking-tight leading-none">{house.name}</h4>
                                </div>
                                <div className="absolute bottom-8 right-6 bg-white/90 backdrop-blur px-3 py-1 rounded-lg font-bold text-xs">
                                    {house.price} ₽ / ночь
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {step === 2 && booking.house && (
                <div className="flex flex-col h-full bg-white">
                    <div className="h-[40vh] w-full relative bg-gray-200">
                       <div className="flex overflow-x-auto snap-x snap-mandatory h-full no-scrollbar">
                          {(booking.house.gallery || [booking.house.cover]).map((img: string, i: number) => (
                            <div key={i} className="min-w-full h-full snap-center relative">
                              <img 
                                src={img} 
                                alt={`${booking.house.name} - фото ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-8 -mt-6 bg-white rounded-t-[32px] relative flex-1">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{booking.house.name}</h3>
                        <p className="text-gray-600 leading-relaxed text-sm font-medium">{booking.house.description}</p>
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0">
                        <button onClick={() => setStep(3)} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-xl">Выбрать даты</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="flex flex-col h-full bg-white p-6">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Даты</h3>
                    <div className="bg-gray-50 p-4 rounded-[30px] mb-auto">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 bg-white rounded-full"><ChevronLeft size={16}/></button>
                            <span className="font-bold uppercase">{monthNames[month]} {year}</span>
                            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 bg-white rounded-full"><ChevronRight size={16}/></button>
                        </div>
                        <div className="grid grid-cols-7 gap-y-2 text-center">
                            {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
                            {Array.from({ length: days }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = new Date(year, month, day + 1).toISOString().split('T')[0];
                                const isBlocked = blockedDates.includes(dateStr);
                                const isSel = booking.startDate?.getDate() === day || booking.endDate?.getDate() === day;
                                const isRange = booking.startDate && booking.endDate && new Date(year, month, day) > booking.startDate && new Date(year, month, day) < booking.endDate;
                                return (
                                    <button key={day} disabled={isBlocked} onClick={() => handleDateClick(day)} className={`h-10 w-10 mx-auto rounded-full text-xs font-bold ${isBlocked ? "text-gray-300 line-through" : isSel ? "bg-black text-white" : isRange ? "bg-gray-200" : "bg-white"}`}>{day}</button>
                                )
                            })}
                        </div>
                    </div>
                    <button disabled={!booking.startDate || !booking.endDate} onClick={() => setStep(4)} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 mt-4">Далее</button>
                </div>
            )}

            {step === 4 && (
                <div className="p-6 h-full flex flex-col">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Детали</h3>
                    <div className="space-y-3 mb-6">
                        {addons.map((addon, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100">
                                <div><div className="font-bold text-sm">{addon.name}</div><div className="text-xs text-gray-400">{addon.price} ₽</div></div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setBooking((p:any) => ({...p, selectedAddons: {...p.selectedAddons, [addon.name]: Math.max(0, (p.selectedAddons[addon.name]||0)-1)}}))} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><Minus size={14}/></button>
                                    <span className="font-bold w-4 text-center">{booking.selectedAddons[addon.name] || 0}</span>
                                    <button onClick={() => setBooking((p:any) => ({...p, selectedAddons: {...p.selectedAddons, [addon.name]: (p.selectedAddons[addon.name]||0)+1}}))} className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"><Plus size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3 mt-auto">
                        <input type="text" placeholder="ИМЯ" className="w-full p-4 rounded-xl border font-bold text-sm" onChange={e => setBooking({...booking, clientName: e.target.value})} />
                        <input type="tel" placeholder="+7 (___) ___-__-__" className="w-full p-4 rounded-xl border font-bold text-sm" value={booking.clientPhone} onChange={handlePhoneChange} />
                        <button disabled={!booking.clientName || !isPhoneValid} onClick={() => setStep(5)} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase disabled:opacity-50">Далее</button>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className="flex flex-col h-full p-6 bg-gray-50">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Итого</h3>
                    
                    <div className="bg-white p-6 rounded-[30px] shadow-lg border border-dashed border-gray-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase text-[10px] font-bold tracking-widest"><Receipt size={14}/> Ваш заказ</div>
                        
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between font-bold text-lg">
                                <span>{booking.house.name}</span>
                                <span>{parseInt(booking.house.price) * Math.ceil((booking.endDate - booking.startDate)/(1000*60*60*24))} ₽</span>
                            </div>
                            <div className="text-xs text-gray-500 pb-2 border-b border-gray-100">
                                {booking.startDate.toLocaleDateString()} — {booking.endDate.toLocaleDateString()}
                            </div>
                            
                            {Object.entries(booking.selectedAddons).map(([n, c]:any) => c > 0 && (
                                <div key={n} className="flex justify-between text-gray-600"><span>{n} x{c}</span><span>{addons.find((a:any)=>a.name===n).price * c} ₽</span></div>
                            ))}
                            
                            <div className="flex justify-between font-black text-xl pt-2">
                                <span>ВСЕГО</span><span>{total} ₽</span>
                            </div>
                        </div>

                        <div className="mt-6 bg-black text-white p-4 rounded-xl text-center">
                            <div className="text-[10px] uppercase opacity-70 mb-1">К оплате сейчас (30%)</div>
                            <div className="text-3xl font-black">{deposit} ₽</div>
                        </div>
                    </div>

                    <button 
                        onClick={handleBookingRequest} 
                        disabled={loading}
                        className="w-full bg-green-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest mt-auto flex justify-center gap-2 shadow-xl hover:bg-green-600 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Связаться для оплаты"}
                    </button>
                </div>
            )}

            {step === 6 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <CheckCircle size={80} className="text-green-500 mb-6 animate-in zoom-in" />
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">Заявка создана!</h3>
                    <p className="text-gray-500 mt-4 max-w-[250px] font-medium">Переходим в Telegram для оплаты брони...</p>
                    <button onClick={reset} className="mt-12 font-bold border-b-2 border-black uppercase text-xs tracking-widest">В меню</button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}