"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Scissors, CheckCircle, Loader2 } from "lucide-react";
// Импортируем элегантный шрифт для кнопок
import { Playfair_Display } from 'next/font/google';

const elegantFont = Playfair_Display({ subsets: ['latin', 'cyrillic'], weight: '600' });

interface BookingWidgetProps {
  services: any[];
  masters: any[];
  businessName: string;
}

export default function BookingWidget({ services, masters, businessName }: BookingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    service: "", price: "", master: "", date: "", time: "", phone: "",
  });

  // --- ГЕНЕРАЦИЯ ДАТ (Ближайшие 14 дней) ---
  const [dates, setDates] = useState<{label: string, value: string}[]>([]);
  
  useEffect(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      // Формат: "Пн, 26"
      const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
      // Значение: "2026-01-26"
      const dateValue = d.toISOString().split('T')[0];
      arr.push({ label: dayName, value: dateValue });
    }
    setDates(arr);
  }, []);

  // --- ГЕНЕРАЦИЯ ВРЕМЕНИ (10:00 - 20:00, шаг 30 мин) ---
  const timeSlots = [];
  for (let hour = 10; hour < 20; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }
  timeSlots.push("20:00");

  // Отправка
  const handleBook = async () => {
    setLoading(true);
    await fetch("/api/telegram", {
      method: "POST",
      body: JSON.stringify({
        businessName,
        service: `${formData.service} (${formData.price})`,
        master: formData.master,
        date: `${formData.date} в ${formData.time}`,
        clientPhone: formData.phone,
      }),
    });
    setLoading(false);
    setStep(4);
  };

  if (!isOpen) {
    return (
      <div className="space-y-4 w-full px-4">
        {/* КНОПКИ ГЛАВНОГО МЕНЮ */}
        {[
            { id: 1, text: "Выбрать услугу", icon: Scissors },
            { id: 2, text: "Выбрать мастера", icon: User },
            { id: 3, text: "Выбрать время", icon: Calendar }
        ].map((btn) => (
          <button 
            key={btn.id}
            onClick={() => { setIsOpen(true); setStep(btn.id); }} 
            className={`w-full bg-white/10 backdrop-blur-md text-white py-5 rounded-xl border border-white/20 hover:bg-white/20 transition flex items-center justify-center relative shadow-lg ${elegantFont.className}`}
          >
            <span className="text-xl tracking-wide uppercase">{btn.text}</span>
            {/* Иконка абсолютная, чтобы текст был ровно по центру */}
            <btn.icon size={20} className="absolute right-6 opacity-60" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[30px] p-6 relative text-slate-900 shadow-2xl animate-in slide-in-from-bottom h-[80vh] flex flex-col">
        
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10">
          <X size={20} />
        </button>

        {/* ШАГ 1: УСЛУГА */}
        {step === 1 && (
          <>
            <h3 className={`text-2xl mb-6 text-center ${elegantFont.className}`}>Выберите услугу</h3>
            <div className="space-y-3 overflow-y-auto flex-1">
              {services.map((s, i) => (
                <div key={i} onClick={() => { setFormData({...formData, service: s.name, price: s.price}); setStep(2); }} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                  <span className="text-lg font-medium">{s.name}</span>
                  <span className={`text-lg ${elegantFont.className}`}>{s.price}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ШАГ 2: МАСТЕР */}
        {step === 2 && (
          <>
            <h3 className={`text-2xl mb-6 text-center ${elegantFont.className}`}>Выберите мастера</h3>
            <div className="space-y-3 overflow-y-auto flex-1">
              <div onClick={() => { setFormData({...formData, master: "Любой мастер"}); setStep(3); }} className="p-4 bg-gray-50 rounded-xl text-center font-medium cursor-pointer">
                Любой свободный мастер
              </div>
              {masters.map((m, i) => (
                <div key={i} onClick={() => { setFormData({...formData, master: m.name}); setStep(3); }} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-200">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                    {/* Если есть фото мастера, можно вывести тут */}
                    <div className="w-full h-full bg-slate-300 flex items-center justify-center">👤</div> 
                  </div>
                  <div>
                    <div className="text-lg font-bold">{m.name}</div>
                    <div className="text-sm text-gray-500">{m.specialty}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ШАГ 3: ДАТА И ВРЕМЯ (Сложный экран) */}
        {step === 3 && (
          <div className="flex flex-col h-full">
            <h3 className={`text-2xl mb-4 text-center ${elegantFont.className}`}>Дата и время</h3>
            
            {/* 1. Горизонтальный скролл дней */}
            <div className="mb-6">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold text-center">Выберите день</div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {dates.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setFormData({...formData, date: d.value, time: ""})} // Сброс времени при смене даты
                    className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                      formData.date === d.value 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105" 
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-sm capitalize">{d.label.split(',')[0]}</span>
                    <span className="text-xl font-bold">{d.label.split(',')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Сетка времени (Показываем только если выбрана дата) */}
            {formData.date && (
              <div className="flex-1 overflow-y-auto">
                <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold text-center">Выберите время</div>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setFormData({...formData, time: time})}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        formData.time === time
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Поле телефона и кнопка (появляются когда выбрано время) */}
            {formData.time && (
              <div className="mt-4 pt-4 border-t animate-in slide-in-from-bottom">
                 <input 
                  type="tel" 
                  placeholder="Ваш номер телефона" 
                  className="w-full p-4 bg-gray-50 rounded-xl border mb-3 focus:outline-slate-900 text-center text-lg"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <button 
                  disabled={!formData.phone || loading}
                  onClick={handleBook}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? "Отправка..." : "ПОДТВЕРДИТЬ ЗАПИСЬ"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ШАГ 4: УСПЕХ */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h3 className={`text-3xl mb-2 ${elegantFont.className}`}>Вы записаны!</h3>
            <p className="text-gray-500 mb-8">Ждем вас {formData.date} в {formData.time}</p>
            <button onClick={() => setIsOpen(false)} className="text-slate-900 font-bold hover:underline">
              Вернуться назад
            </button>
          </div>
        )}

      </div>
    </div>
  );
}