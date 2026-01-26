"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Scissors, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BookingWidgetProps {
  services: any[];
  masters: any[];
  businessName: string;
}

export default function BookingWidget({ services, masters, businessName }: BookingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  // Начальное состояние формы (пустое)
  const emptyForm = {
    service: "",
    price: "",
    master: "",
    date: "",
    time: "",
    name: "",
    phone: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // --- ФУНКЦИЯ СБРОСА И ЗАКРЫТИЯ ---
  const closeAndReset = () => {
    setIsOpen(false);
    setFormData(emptyForm); // Очищаем данные
    setStep(1); // Сбрасываем на первый шаг
  };

  // --- ЛОГИКА ГРУППИРОВКИ УСЛУГ ---
  const groupedServices = services.reduce((acc: any, service) => {
    const category = service.category || "Основные услуги";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  const categoryOrder = ["Мужские стрижки", "Женские стрижки", "Детские стрижки", "Оформление бороды", "Основные услуги"];

  const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // --- ГЕНЕРАЦИЯ ДАТ ---
  const [dates, setDates] = useState<{label: string, value: string}[]>([]);
  useEffect(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push({ 
        label: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }), 
        value: d.toISOString().split('T')[0] 
      });
    }
    setDates(arr);
  }, []);

  // --- ГЕНЕРАЦИЯ ВРЕМЕНИ ---
  const timeSlots = [];
  for (let hour = 10; hour < 20; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }
  timeSlots.push("20:00");

  // --- ПРОВЕРКА ЗАНЯТОСТИ ---
  const handleDateSelect = async (selectedDate: string) => {
    setFormData(prev => ({...prev, date: selectedDate, time: ""}));
    const { data } = await supabase
      .from('bookings')
      .select('time')
      .eq('booking_date', selectedDate)
      .eq('master_name', formData.master);

    if (data) setBookedTimes(data.map(b => b.time));
    else setBookedTimes([]);
  };

  const handleBook = async () => {
    setLoading(true);
    await fetch("/api/telegram", {
      method: "POST",
      body: JSON.stringify({
        businessName,
        service: `${formData.service} (${formData.price})`,
        master: formData.master,
        date: formData.date,
        time: formData.time,
        clientName: formData.name,
        clientPhone: formData.phone,
      }),
    });
    setLoading(false);
    setStep(4);
  };

  // --- НАВИГАЦИЯ ---
  const selectService = (name: string, price: string) => {
    setFormData(prev => ({ ...prev, service: name, price: price }));
    if (formData.master) setStep(3); else setStep(2);
  };

  const selectMaster = (name: string) => {
    setFormData(prev => ({ ...prev, master: name }));
    if (formData.service) setStep(3); else setStep(1);
  };

  const openWidget = (targetStep: number) => {
    setIsOpen(true);
    if (targetStep === 3 && (!formData.service || !formData.master)) {
      setStep(1); 
    } else {
      setStep(targetStep);
    }
  };

  if (!isOpen) {
    return (
      <div className="space-y-4 w-full px-4">
        {/* Кнопка Услуги */}
        <button onClick={() => openWidget(1)} className="w-full bg-white text-black py-4 rounded-xl shadow-lg hover:bg-gray-100 transition flex items-center justify-center relative font-bold">
          <span className="text-lg tracking-wide">{formData.service || "Выбрать услугу"}</span>
          <Scissors size={20} className="absolute right-6 opacity-60" />
        </button>

        {/* Кнопка Мастера */}
        <button onClick={() => openWidget(2)} className="w-full bg-white text-black py-4 rounded-xl shadow-lg hover:bg-gray-100 transition flex items-center justify-center relative font-bold">
          <span className="text-lg tracking-wide">{formData.master || "Выбрать мастера"}</span>
          <User size={20} className="absolute right-6 opacity-60" />
        </button>

        {/* Кнопка Время */}
        <button onClick={() => openWidget(3)} className="w-full bg-white text-black py-4 rounded-xl shadow-lg hover:bg-gray-100 transition flex items-center justify-center relative font-bold">
          <span className="text-lg tracking-wide">
            {formData.date && formData.time ? `${formData.date} ${formData.time}` : "Выбрать время"}
          </span>
          <Calendar size={20} className="absolute right-6 opacity-60" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative text-slate-900 shadow-2xl h-[85vh] flex flex-col">
        
        {/* КРЕСТИК ТЕПЕРЬ ВЫЗЫВАЕТ closeAndReset */}
        <button onClick={closeAndReset} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10">
          <X size={20} />
        </button>

        {/* --- ШАГ 1: ВЫБОР УСЛУГИ --- */}
        {step === 1 && (
          <div className="flex flex-col h-full">
            <h3 className="text-2xl mb-4 text-center font-bold">Выберите услугу</h3>
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              {sortedCategories.map((category) => (
                <div key={category} className="animate-in slide-in-from-bottom duration-500">
                  <div className="sticky top-0 bg-white/95 backdrop-blur py-2 z-10 border-b mb-2">
                    <h4 className="text-md font-extrabold text-slate-900 uppercase tracking-widest">{category}</h4>
                  </div>
                  <div className="space-y-2">
                    {groupedServices[category].map((s: any, i: number) => (
                      <div key={i} onClick={() => selectService(s.name, s.price)} className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${formData.service === s.name ? 'border-black bg-slate-900 text-white shadow-lg' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                        <span className="font-medium text-lg">{s.name}</span>
                        <span className={`text-lg font-bold ${formData.service === s.name ? 'text-white' : 'text-slate-900'}`}>{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ШАГ 2: МАСТЕРА --- */}
        {step === 2 && (
          <div className="flex flex-col h-full">
            <h3 className="text-2xl mb-4 text-center font-bold">Выберите мастера</h3>
            <div className="space-y-2 overflow-y-auto flex-1">
              <div onClick={() => selectMaster("Любой мастер")} className="p-4 bg-gray-100 rounded-xl text-center font-medium cursor-pointer hover:bg-gray-200">Любой свободный мастер</div>
              {masters.map((m, i) => (
                <div key={i} onClick={() => selectMaster(m.name)} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-all ${formData.master === m.name ? 'border-black bg-slate-900 text-white' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}>
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border border-gray-100 shrink-0">
                    {m.photo_url ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{m.name}</div>
                    <div className="text-sm opacity-70">{m.specialty || "Мастер"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ШАГ 3: ДАТА И ВРЕМЯ --- */}
        {step === 3 && (
          <div className="flex flex-col h-full overflow-y-auto pb-4 no-scrollbar">
            <h3 className="text-xl mb-4 text-center font-bold">Дата и время</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
              {dates.map((d) => (
                <button key={d.value} onClick={() => handleDateSelect(d.value)} className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${formData.date === d.value ? "bg-black text-white shadow-md" : "bg-white text-gray-700 border-gray-200"}`}>
                  <div className="text-xs opacity-70">{d.label.split(',')[0]}</div>
                  <div className="font-bold text-lg">{d.label.split(',')[1]}</div>
                </button>
              ))}
            </div>
            {formData.date && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                {timeSlots.map((time) => {
                  const isBooked = bookedTimes.includes(time);
                  return (
                    <button key={time} disabled={isBooked} onClick={() => setFormData(prev => ({...prev, time: time}))} className={`py-2 rounded-lg text-sm font-bold transition-all ${isBooked ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through decoration-gray-300" : formData.time === time ? "bg-black text-white shadow-md" : "border text-gray-700 hover:border-black"}`}>
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
            {formData.time && (
              <div className="space-y-3 mt-auto animate-in slide-in-from-bottom">
                 <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600 mb-2">
                    <span className="font-bold text-black">{formData.service}</span> к мастеру <span className="font-bold text-black">{formData.master}</span>
                 </div>
                 <input type="text" placeholder="Ваше Имя" className="w-full p-4 bg-gray-50 rounded-xl border focus:outline-black text-lg transition-all" onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))} />
                 <input type="tel" placeholder="Телефон" className="w-full p-4 bg-gray-50 rounded-xl border focus:outline-black text-lg transition-all" onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))} />
                <button disabled={!formData.phone || !formData.name || loading} onClick={handleBook} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 transition-all shadow-xl">
                  {loading ? "Записываем..." : "ПОДТВЕРДИТЬ ЗАПИСЬ"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- ШАГ 4: УСПЕХ (Здесь можно оставить reload или тоже вызывать reset) --- */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle size={80} className="text-green-500 mb-6" />
            <h3 className="text-3xl font-bold mb-2">Вы записаны!</h3>
            <p className="text-gray-500 mb-8">{formData.name}, ждем вас {formData.date} в {formData.time}</p>
            {/* После успешной записи логично обновить страницу полностью */}
            <button onClick={() => window.location.reload()} className="text-black font-bold border-b-2 border-black pb-1 hover:opacity-70">На главную</button>
          </div>
        )}
      </div>
    </div>
  );
}