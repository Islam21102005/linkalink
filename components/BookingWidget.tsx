"use client";

import { useState, useMemo, useCallback } from "react";
import {
  X,
  Calendar,
  User,
  Scissors,
  CheckCircle,
  Loader2,
  Plus,
  Minus
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ================= TYPES ================= */

export interface Service {
  id?: string | number;
  name: string;
  price: number | string;
  category?: string;
  duration_minutes?: number;
}

export interface Master {
  id?: string | number;
  name: string;
  photo_url?: string;
  specialization?: string;
  specialty?: string;
  on_duty?: boolean;
}

export interface Addon {
  id?: string | number;
  name: string;
  price: number;
}

export interface BookingWidgetProps {
  services: Service[];
  masters: Master[];
  addons?: Addon[];
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
  selectedAddons: Record<string, number>;
}

/* ================= COMPONENT ================= */

export default function BookingWidget({
  services,
  masters,
  addons,
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
    phone: "",
    selectedAddons: {}
  };

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const safeAddons = addons ?? [];
  const hasAddons = safeAddons.length > 0;
  const TIME_STEP = hasAddons ? 4 : 3;
  const SUCCESS_STEP = hasAddons ? 5 : 4;

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
    const result: { label: string; value: string }[] = [];
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

  const isPhoneValid = formData.phone.length >= 17;

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
        .eq("master_name", formData.master)
        .neq("status", "cancelled");

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

    const addonsText = Object.entries(formData.selectedAddons)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => `${name} (x${count})`)
      .join(", ");

    const finalServiceText = addonsText
      ? `${formData.service} (${formData.price}) + Допы: ${addonsText}`
      : `${formData.service} (${formData.price})`;

    const payload = {
      businessSlug: businessName,
      service: finalServiceText,
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

      setStep(SUCCESS_STEP);
    } catch (error) {
      console.error("Ошибка отправки:", error);
    } finally {
      setLoading(false);
    }
  }, [formData, businessName, SUCCESS_STEP]);

  const closeAndReset = useCallback(() => {
    setIsOpen(false);
    setFormData(emptyForm);
    setStep(1);
    setBookedTimes([]);
  }, []);

  /* ================= UI ================= */

  if (!isOpen) {
    const navButtons = [
      { id: 1, text: formData.service || "Выбрать услугу", icon: Scissors, hide: false },
      { id: 2, text: formData.master || "Выбрать мастера", icon: User, hide: false },
      { id: 3, text: "Доп. услуги", icon: Plus, hide: !hasAddons },
      {
        id: TIME_STEP,
        text: formData.date && formData.time ? `${formData.date} ${formData.time}` : "Выбрать время",
        icon: Calendar,
        hide: false
      }
    ];

    return (
      <div className="space-y-4 w-full">
        {navButtons.filter(btn => !btn.hide).map(btn => (
          <button
            key={btn.id}
            onClick={() => {
              setIsOpen(true);
              setStep(btn.id);
            }}
            className="w-full h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center relative font-bold hover:bg-gray-50 transition-colors"
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

  /* ===== Дальше JSX шагов остаётся тем же, кроме ADDONS ===== */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl h-5/6 flex flex-col relative">

        <button
          onClick={closeAndReset}
          className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        {step === 3 && hasAddons && (
          <div className="flex flex-col h-full pt-2">
            <h3 className="text-2xl font-black uppercase mb-2 italic">
              Доп. услуги
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3">
              {safeAddons.map((addon, idx) => {
                const currentCount =
                  formData.selectedAddons[addon.name] || 0;

                return (
                  <div
                    key={addon.id || idx}
                    className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-sm">{addon.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {addon.price} ₽
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setFormData(p => ({
                            ...p,
                            selectedAddons: {
                              ...p.selectedAddons,
                              [addon.name]: Math.max(0, currentCount - 1)
                            }
                          }))
                        }
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="font-bold w-4 text-center">
                        {currentCount}
                      </span>

                      <button
                        onClick={() =>
                          setFormData(p => ({
                            ...p,
                            selectedAddons: {
                              ...p.selectedAddons,
                              [addon.name]: currentCount + 1
                            }
                          }))
                        }
                        className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(TIME_STEP)}
              className="w-full h-14 mt-4 bg-black text-white rounded-xl font-bold uppercase"
            >
              Далее
            </button>
          </div>
        )}
      </div>
    </div>
  );
}