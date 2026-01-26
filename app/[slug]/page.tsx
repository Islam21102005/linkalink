import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Bebas_Neue } from 'next/font/google'; 
import { Instagram, Send } from "lucide-react";
import BookingWidget from "@/components/BookingWidget";

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] });

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Получаем данные
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !business) {
    notFound();
  }

  // Получаем мастеров
  const { data: masters } = await supabase
    .from("masters")
    .select("*")
    .eq("business_id", business.id);

  const services = business.services as any[];

  // 2. Картинки (берем из базы или ставим заглушки)
  const defaultBg = "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1000";
  const bgImage = business.bg_image || defaultBg;

  // Аватарка из базы (или генератор)
  const avatarUrl = business.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=000&color=fff`;
  
  // Шапка (если нет в базе - просто черный градиент)
  const headerUrl = business.header_url || defaultBg;

  return (
    <div 
      className="min-h-screen flex justify-center font-sans bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[5px] z-0"></div>

      {/* Контейнер приложения */}
      <main className="w-full max-w-[480px] min-h-screen z-10 bg-transparent flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* --- ШАПКА (HEADER) --- */}
        <div 
            className="h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url('${headerUrl}')` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>

        {/* --- ПРОФИЛЬ (Аватар + Текст) --- */}
        <div className="px-6 -mt-16 relative flex flex-col items-center text-center">
            {/* Аватарка (Круглая с белой обводкой) */}
            <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden mb-4">
                <img src={avatarUrl} alt={business.name} className="w-full h-full object-cover" />
            </div>

            {/* Название (Шрифт BEBAS NEUE, Заглавные) */}
            <h1 className={`${bebas.className} text-5xl text-white tracking-wider drop-shadow-lg uppercase leading-none mb-2`}>
                {business.name}
            </h1>
            
            <p className="text-white/70 text-sm font-medium max-w-[80%] mb-6 leading-relaxed">
                {business.description}
            </p>

            {/* --- СОЦСЕТИ (Без кружков) --- */}
            <div className="flex gap-8 items-center justify-center mb-8">
                {business.telegram && (
                    <a href={`https://t.me/${business.telegram}`} target="_blank" className="text-white/80 hover:text-white transition transform hover:scale-110">
                        <Send size={28} />
                    </a>
                )}
                {/* Инстаграм (просто ссылка, можно добавить поле в базу позже) */}
                <a href="#" className="text-white/80 hover:text-white transition transform hover:scale-110">
                    <Instagram size={28} />
                </a>
            </div>
        </div>

        {/* --- ВИДЖЕТ ЗАПИСИ --- */}
        <div className="flex-1 pb-10">
           <BookingWidget 
             services={services} 
             masters={masters || []} 
             businessName={business.name} 
           />
        </div>

        <div className="text-center text-white/20 text-xs pb-6">
          Linkalink © 2026
        </div>

      </main>
    </div>
  );
}