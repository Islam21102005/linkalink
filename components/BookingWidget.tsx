"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Scissors, CheckCircle, Loader2 } from "lucide-react";
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
  const [bookedTimes, setBookedTimes] = useState<string[]>([]); // Занятые часы

  const [formData, setFormData] = useState({
    service: "", price: "", master: "", date: "", time: "", name: "", phone: "",
  });

  // Генерация дней
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

  // Генерация времени
  const timeSlots = [];
  for (let hour = 10; hour < 20; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }
  timeSlots.push("20:00");

  // ФУНКЦИЯ: Проверка занятого времени при выборе даты
  const handleDateSelect = async (selectedDate: string) => {
    setFormData({...formData, date: selectedDate, time: ""});
    
    // Ищем записи на эту дату к этому мастеру
    const { data } = await supabase
      .from('bookings')
      .select('time')
      .eq('booking_date', selectedDate)
      .eq('master_name', formData.master);

    if (data) {
      setBookedTimes(data.map(b => b.time)); // Сохраняем занятые слоты
    } else {
      setBookedTimes([]);
    }
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
        clientName: formData.name, // Имя
        clientPhone: formData.phone,
      }),
    });
    setLoading(false);
    setStep(4);
  };

  if (!isOpen) {
    return (
      <div className="space-y-4 w-full px-4">
        {[
            { id: 1, text: "Выбрать услугу", icon: Scissors },
            { id: 2, text: "Выбрать мастера", icon: User },
            { id: 3, text: "Выбрать время", icon: Calendar }
        ].map((btn) => (
          <button 
            key={btn.id}
            onClick={() => { setIsOpen(true); setStep(btn.id); }} 
            // КНОПКИ БЕЛЫЕ С ЧЕРНЫМ ТЕКСТОМ
            className="w-full bg-white text-black py-4 rounded-xl shadow-lg hover:bg-gray-100 transition flex items-center justify-center relative font-bold"
          >
            <span className="text-lg tracking-wide">{btn.text}</span>
            <btn.icon size={20} className="absolute right-6 opacity-60" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative text-slate-900 shadow-2xl h-[85vh] flex flex-col">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <X size={20} />
        </button>

        {step === 1 && (
          // ... (Шаг 1 без изменений) ...
          <>
            <h3 className="text-2xl mb-4 text-center font-bold">Выберите услугу</h3>
            <div className="space-y-2 overflow-y-auto">
              {services.map((s, i) => (
                <div key={i} onClick={() => { setFormData({...formData, service: s.name, price: s.price}); setStep(2); }} className="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer flex justify-between">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-bold">{s.price}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          // ... (Шаг 2 без изменений) ...
          <>
            <h3 className="text-2xl mb-4 text-center font-bold">Выберите мастера</h3>
            <div className="space-y-2 overflow-y-auto">
              <div onClick={() => { setFormData({...formData, master: "Любой мастер"}); setStep(3); }} className="p-4 bg-gray-100 rounded-xl text-center font-medium cursor-pointer">Любой мастер</div>
              {masters.map((m, i) => (
                <div key={i} onClick={() => { setFormData({...formData, master: m.name}); setStep(3); }} className="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer">
                  <span className="font-bold">{m.name}</span> <span className="text-gray-500">({m.specialty})</span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="flex flex-col h-full overflow-y-auto pb-4 no-scrollbar">
            <h3 className="text-xl mb-4 text-center font-bold">Дата и время</h3>
            
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleDateSelect(d.value)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border ${formData.date === d.value ? "bg-black text-white" : "bg-white text-gray-700"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {formData.date && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {timeSlots.map((time) => {
                  const isBooked = bookedTimes.includes(time); // ПРОВЕРКА НА ЗАНЯТОСТЬ
                  return (
                    <button
                      key={time}
                      disabled={isBooked}
                      onClick={() => setFormData({...formData, time: time})}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        isBooked ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through" : 
                        formData.time === time ? "bg-black text-white" : "border text-gray-700 hover:border-black"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}

            {formData.time && (
              <div className="space-y-3 mt-auto">
                 {/* ДОБАВЛЕНО ПОЛЕ ИМЯ */}
                 <input 
                  type="text" 
                  placeholder="Ваше Имя" 
                  className="w-full p-4 bg-gray-50 rounded-xl border focus:outline-black text-lg"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                 <input 
                  type="tel" 
                  placeholder="Ваш телефон" 
                  className="w-full p-4 bg-gray-50 rounded-xl border focus:outline-black text-lg"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <button 
                  disabled={!formData.phone || !formData.name || loading}
                  onClick={handleBook}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
                >
                  {loading ? "Отправка..." : "ПОДТВЕРДИТЬ"}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle size={60} className="text-green-500 mb-4" />
            <h3 className="text-2xl font-bold">Вы записаны!</h3>
          </div>
        )}
      </div>
    </div>
  );
}