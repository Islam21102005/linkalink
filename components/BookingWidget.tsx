"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Scissors, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function BookingWidget({ services, masters, businessName }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const emptyForm = { service: "", price: "", master: "", date: "", time: "", name: "", phone: "" };
  const [formData, setFormData] = useState(emptyForm);

  // --- ФУНКЦИЯ МАСКИ ТЕЛЕФОНА ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ""); // Убираем всё кроме цифр
    
    // Если начали вводить с 8 или 7, убираем первую цифру, чтобы не дублировать код страны
    if (input.startsWith("7") || input.startsWith("8")) {
      input = input.slice(1);
    }
    
    // Ограничиваем длину (10 цифр после +7)
    if (input.length > 10) input = input.slice(0, 10);

    // Формируем красивую строку +7 (XXX) ...
    let formatted = "";
    if (input.length >= 0) formatted = "+7";
    if (input.length > 0) formatted += " (" + input.slice(0, 3);
    if (input.length >= 4) formatted += ") " + input.slice(3, 6);
    if (input.length >= 7) formatted += "-" + input.slice(6, 8);
    if (input.length >= 9) formatted += "-" + input.slice(8, 10);

    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setFormData(emptyForm);
    setStep(1);
  };

  const groupedServices = services.reduce((acc: any, s: any) => {
    const cat = s.category || "Общие услуги";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const [dates, setDates] = useState<{label: string, value: string}[]>([]);
  useEffect(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      arr.push({ label: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }), value: d.toISOString().split('T')[0] });
    }
    setDates(arr);
  }, []);

  const timeSlots = [];
  for (let h = 10; h < 20; h++) { timeSlots.push(`${h}:00`); timeSlots.push(`${h}:30`); }
  timeSlots.push("20:00");

  const handleDateSelect = async (d: string) => {
    setFormData(p => ({...p, date: d, time: ""}));
    const { data } = await supabase.from('bookings').select('time').eq('booking_date', d).eq('master_name', formData.master);
    setBookedTimes(data ? data.map(b => b.time) : []);
  };

  const handleBook = async () => {
    setLoading(true);
    await fetch("/api/telegram", { 
      method: "POST", 
      body: JSON.stringify({ 
        ...formData, 
        businessName,
        clientName: formData.name, // Явно передаем имя как clientName
        clientPhone: formData.phone 
      }) 
    });
    setLoading(false);
    setStep(4);
  };

  const openWidget = (s: number) => {
    setIsOpen(true);
    setStep(s === 3 && (!formData.service || !formData.master) ? 1 : s);
  };

  // Валидация телефона: +7 (XXX) XXX-XX-XX — это 18 символов
  const isPhoneValid = formData.phone.length === 18;

  if (!isOpen) {
    return (
      <div className="space-y-4 w-full">
        {[
            { id: 1, t: formData.service || "Выбрать услугу", i: Scissors },
            { id: 2, t: formData.master || "Выбрать мастера", i: User },
            { id: 3, t: formData.date && formData.time ? `${formData.date} ${formData.time}` : "Выбрать время", i: Calendar }
        ].map((btn) => (
          <button key={btn.id} onClick={() => openWidget(btn.id)} className="w-full h-16 bg-white text-black rounded-2xl shadow-xl flex items-center justify-center relative font-bold hover:bg-gray-50 transition-all active:scale-[0.98]">
            <span className="text-lg tracking-[0.2em] uppercase truncate px-12">{btn.t}</span>
            <btn.i size={20} className="absolute right-6 opacity-40" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-[420px] rounded-[40px] p-8 relative text-slate-900 shadow-2xl h-[80vh] flex flex-col animate-in zoom-in">
        <button onClick={closeAndReset} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <X size={20} />
        </button>

        {step === 1 && (
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="text-2xl font-black uppercase mb-6 tracking-tighter italic">Услуги</h3>
            <div className="space-y-6 overflow-y-auto no-scrollbar pr-1">
              {Object.keys(groupedServices).map(cat => (
                <div key={cat}>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{cat}</h4>
                  <div className="space-y-2">
                    {groupedServices[cat].map((s: any, i: number) => (
                      <div key={i} onClick={() => { setFormData(p => ({...p, service: s.name, price: s.price})); setStep(formData.master ? 3 : 2); }} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center hover:border-black transition-colors cursor-pointer">
                        <span className="font-bold">{s.name}</span>
                        <span className="text-sm opacity-50">{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
            <div className="flex flex-col h-full">
                <h3 className="text-2xl font-black uppercase mb-6 tracking-tighter italic">Мастер</h3>
                <div className="space-y-3 overflow-y-auto no-scrollbar">
                    {masters.map((m: any, i: number) => (
                        <div key={i} onClick={() => { setFormData(p => ({...p, master: m.name})); setStep(formData.service ? 3 : 1); }} className="flex items-center gap-4 p-3 border border-gray-100 rounded-2xl hover:border-black cursor-pointer transition-all">
                            <img src={m.photo_url || ""} className="w-14 h-14 rounded-full object-cover bg-gray-100" alt="" />
                            <div>
                                <div className="font-bold uppercase text-sm tracking-widest">{m.name}</div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold">{m.specialty}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="flex flex-col h-full">
                <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter italic">Время</h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
                    {dates.map(d => (
                        <button key={d.value} onClick={() => handleDateSelect(d.value)} className={`shrink-0 px-5 py-3 rounded-2xl border transition-all ${formData.date === d.value ? 'bg-black text-white border-black' : 'border-gray-100'}`}>
                            <div className="text-[10px] font-bold uppercase mb-1 opacity-50">{d.label.split(' ')[0]}</div>
                            <div className="text-lg font-black">{d.label.split(' ')[1]}</div>
                        </button>
                    ))}
                </div>
                {formData.date && (
                    <div className="grid grid-cols-4 gap-2 overflow-y-auto no-scrollbar pb-20">
                        {timeSlots.map(t => (
                            <button key={t} disabled={bookedTimes.includes(t)} onClick={() => setFormData(p => ({...p, time: t}))} className={`py-3 rounded-xl text-xs font-bold ${bookedTimes.includes(t) ? 'opacity-20 pointer-events-none' : formData.time === t ? 'bg-black text-white' : 'bg-gray-50'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                )}
                {formData.time && (
                    <div className="absolute bottom-8 left-8 right-8 space-y-3 bg-white pt-4">
                        <input 
                          type="text" 
                          placeholder="ИМЯ" 
                          className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-bold text-sm focus:ring-2 ring-black" 
                          value={formData.name}
                          onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                        />
                        <input 
                          type="tel" 
                          placeholder="+7 (___) ___-__-__" 
                          className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-bold text-sm focus:ring-2 ring-black" 
                          value={formData.phone}
                          onChange={handlePhoneChange} // Используем нашу маску
                        />
                        <button 
                          onClick={handleBook} 
                          disabled={!formData.name || !isPhoneValid || loading} 
                          className="w-full h-16 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? "Запись..." : "Подтвердить"}
                        </button>
                    </div>
                )}
            </div>
        )}

        {step === 4 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <CheckCircle size={80} className="text-green-500 mb-6" />
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Готово!</h3>
                <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">Ждем вас {formData.time}</p>
                <button onClick={() => window.location.reload()} className="mt-10 font-bold border-b-2 border-black uppercase text-xs tracking-widest">На главную</button>
            </div>
        )}
      </div>
    </div>
  );
}