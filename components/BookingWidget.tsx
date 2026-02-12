"use client";

import { useState, useMemo, useCallback } from "react";
import {
  X,
  Calendar,
  User,
  Scissors,
  CheckCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ================= TYPES ================= */

interface Service {
  id?: string;
  name: string;
  price: string;
  category?: string;
}

interface Master {
  id?: string;
  name: string;
  photo_url?: string;
  specialty?: string;
  on_duty?: boolean;
}

interface BookingWidgetProps {
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

/* ================= COMPONENT ================= */

export default function BookingWidget({
  services,
  masters,
  businessName
}: BookingWidgetProps) {
  /* ================= STATE ================= */

  const emptyForm: FormData = {
    service: "",
    price: "",
    master: "",
    date: "",
    time: "",
    name: "",
    phone: ""
  };

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  /* ================= MEMO ================= */

  const groupedServices = useMemo(() => {
    return services.reduce<Record<string, Service[]>>((acc, service) => {
      const category = service.category || "Общие услуги";
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {});
  }, [services]);

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      result.push({
        label: d.toLocaleDateString("ru-RU", {
          weekday: "short",
          day: "numeric"
        }),
        value: d.toISOString().split("T")[0]
      });
    }

    return result;
  }, []);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 10; h < 20; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }
    slots.push("20:00");
    return slots;
  }, []);

  const isPhoneValid = formData.phone.length === 18;

  /* ================= HANDLERS ================= */

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value.replace(/\D/g, "");

      if (input.startsWith("7") || input.startsWith("8")) {
        input = input.slice(1);
      }

      if (input.length > 10) input = input.slice(0, 10);

      let formatted = "";
      if (input.length > 0) formatted = "+7";
      if (input.length > 0) formatted += " (" + input.slice(0, 3);
      if (input.length >= 4) formatted += ") " + input.slice(3, 6);
      if (input.length >= 7) formatted += "-" + input.slice(6, 8);
      if (input.length >= 9) formatted += "-" + input.slice(8, 10);

      setFormData(prev => ({ ...prev, phone: formatted }));
    },
    []
  );

  const handleDateSelect = useCallback(
    async (date: string) => {
      if (!formData.master) return;

      setFormData(prev => ({ ...prev, date, time: "" }));

      const { data, error } = await supabase
        .from("bookings")
        .select("time")
        .eq("booking_date", date)
        .eq("master_name", formData.master);

      if (error) {
        console.error("Ошибка загрузки времени:", error);
        return;
      }

      setBookedTimes(data ? data.map(b => b.time) : []);
    },
    [formData.master]
  );

  const handleBook = useCallback(async () => {
    setLoading(true);

    const payload = {
      businessSlug: businessName,
      service: `${formData.service} (${formData.price})`,
      master: formData.master,
      date: formData.date,
      time: formData.time,
      clientName: formData.name,
      clientPhone: formData.phone
    };

    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setStep(4);
    } catch (error) {
      console.error("Ошибка отправки:", error);
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

  /* ================= UI ================= */

  if (!isOpen) {
    return (
      <div className="space-y-4 w-full">
        {[
          { id: 1, text: formData.service || "Выбрать услугу", icon: Scissors },
          { id: 2, text: formData.master || "Выбрать мастера", icon: User },
          {
            id: 3,
            text:
              formData.date && formData.time
                ? `${formData.date} ${formData.time}`
                : "Выбрать время",
            icon: Calendar
          }
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => {
              setIsOpen(true);
              setStep(btn.id);
            }}
            className="w-full h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center relative font-bold hover:bg-gray-50"
          >
            <span className="text-lg uppercase truncate px-12">
              {btn.text}
            </span>
            <btn.icon size={20} className="absolute right-6 opacity-40" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-[420px] rounded-[40px] p-8 shadow-2xl h-[80vh] flex flex-col relative">

        <button
          onClick={closeAndReset}
          className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <div className="overflow-y-auto">
            <h3 className="text-2xl font-black uppercase mb-6 italic">
              Услуги
            </h3>

            {Object.entries(groupedServices).map(([category, list]) => (
              <div key={category} className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">
                  {category}
                </h4>

                {list.map(service => (
                  <div
                    key={service.name}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        service: service.name,
                        price: service.price
                      }));
                      setStep(formData.master ? 3 : 2);
                    }}
                    className="p-4 border rounded-2xl flex justify-between cursor-pointer hover:border-black mb-2"
                  >
                    <span className="font-bold">{service.name}</span>
                    <span className="opacity-50">{service.price}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div className="overflow-y-auto">
            <h3 className="text-2xl font-black uppercase mb-6 italic text-center">
              Выберите мастера
            </h3>

            {masters.map(master => (
              <div
                key={master.name}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    master: master.name
                  }));
                  setStep(formData.service ? 3 : 1);
                }}
                className="p-4 border rounded-2xl cursor-pointer hover:border-black mb-3"
              >
                <div className="font-bold uppercase text-sm">
                  {master.name}
                </div>
                <div className="text-xs text-gray-400">
                  {master.specialty}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="flex flex-col h-full">
            <h3 className="text-2xl font-black uppercase mb-4 italic">
              Время
            </h3>

            <div className="flex gap-2 overflow-x-auto mb-4">
              {dates.map(d => (
                <button
                  key={d.value}
                  onClick={() => handleDateSelect(d.value)}
                  className={`px-4 py-2 rounded-xl border ${
                    formData.date === d.value
                      ? "bg-black text-white"
                      : ""
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {formData.date && (
              <div className="grid grid-cols-4 gap-2 overflow-y-auto">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    disabled={bookedTimes.includes(time)}
                    onClick={() =>
                      setFormData(prev => ({ ...prev, time }))
                    }
                    className={`py-2 rounded-xl text-xs font-bold ${
                      bookedTimes.includes(time)
                        ? "opacity-20"
                        : formData.time === time
                        ? "bg-black text-white"
                        : "bg-gray-50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}

            {formData.time && (
              <div className="mt-auto space-y-3 pt-4">
                <input
                  type="text"
                  placeholder="ИМЯ"
                  className="w-full h-12 bg-gray-50 rounded-xl px-4"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                />

                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  className="w-full h-12 bg-gray-50 rounded-xl px-4"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />

                <button
                  onClick={handleBook}
                  disabled={!formData.name || !isPhoneValid || loading}
                  className="w-full h-14 bg-black text-white rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Запись..." : "Подтвердить"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4 ================= */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle size={80} className="text-green-500 mb-6" />
            <h3 className="text-3xl font-black uppercase italic">
              Готово!
            </h3>
            <p className="text-gray-400 mt-2">
              Ждем вас {formData.time}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-10 font-bold border-b-2 border-black uppercase text-xs"
            >
              На главную
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
