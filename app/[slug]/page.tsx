import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Phone, MessageCircle, MapPin, Check, Star } from "lucide-react";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Запрос к базе данных
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !business) {
    notFound();
  }

  const services = business.services as any[];

  // Генерация аватарки из названия (пока нет фото)
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=0D8ABC&color=fff&size=200&font-size=0.4`;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      
      {/* МОБИЛЬНЫЙ КОНТЕЙНЕР (ограничиваем ширину) */}
      <main className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl flex flex-col">
        
        {/* 1. ШАПКА ПРОФИЛЯ */}
        <div className="bg-slate-900 text-white pt-12 pb-8 px-6 text-center rounded-b-[30px] mb-6">
          <div className="relative mx-auto w-24 h-24 mb-4">
            <img 
              src={avatarUrl} 
              alt={business.name} 
              className="rounded-full border-4 border-white/20 shadow-xl object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 p-1.5 rounded-full border-2 border-slate-900">
              <Check size={12} color="white" strokeWidth={4} />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{business.name}</h1>
          <p className="text-slate-300 text-sm leading-relaxed px-2">
            {business.description}
          </p>
        </div>

        {/* 2. КНОПКИ СВЯЗИ */}
        <div className="px-6 grid grid-cols-2 gap-3 mb-8">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-all"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3.5 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all"
            >
              <Phone size={20} />
              Позвонить
            </a>
          )}
        </div>

        {/* 3. СПИСОК УСЛУГ */}
        <div className="px-6 flex-1 pb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
            Прайс-лист
          </h2>
          
          <div className="space-y-3">
            {services && services.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <span className="text-gray-700 font-medium">{service.name}</span>
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-sm font-bold">
                  {service.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ФУТЕР (Подпись сервиса) */}
        <div className="py-6 text-center text-gray-400 text-xs">
          Powered by <span className="font-bold text-slate-900">Linkalink</span>
        </div>

      </main>
    </div>
  );
}