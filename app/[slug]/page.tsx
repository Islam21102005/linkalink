import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Instagram, Send } from "lucide-react"; 
import BookingWidget from "@/components/BookingWidget";
import AboutWidget from "@/components/AboutWidget";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Получаем данные бизнеса из базы
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !business) {
    notFound();
  }

  // 2. Получаем мастеров этого бизнеса
  const { data: masters } = await supabase
    .from("masters")
    .select("*")
    .eq("business_id", business.id);

  // 3. Настройка картинок
  const bgImage = business.bg_image || "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1000";
  const avatarUrl = business.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=000&color=fff`;

  return (
    <div 
      className="min-h-screen flex justify-center bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Затемняющий слой для читаемости текста */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0"></div>

      {/* Основной мобильный контейнер */}
      <main className="w-full max-w-[480px] min-h-screen z-10 flex flex-col relative pt-16">
        
        {/* --- СЕКЦИЯ ПРОФИЛЯ --- */}
        <div className="px-6 flex flex-col items-center text-center">
            
            {/* Аватарка */}
            <div className="mb-6">
              <img 
                src={avatarUrl} 
                alt={business.name} 
                className="w-32 h-32 rounded-full border-2 border-white/40 shadow-2xl object-cover" 
              />
            </div>

            {/* Название заведения (Заглавные буквы) */}
            <h1 className="text-4xl text-white font-bold uppercase mb-2 leading-none tracking-[0.2em]">
                {business.name}
            </h1>
            
            {/* Слоган / Описание */}
            <p className="text-white/70 text-xs font-medium mb-8 max-w-[85%] leading-relaxed uppercase tracking-widest">
                {business.description || "Барбершоп, который слышит"}
            </p>

            {/* --- СОЦСЕТИ (Иконки без фона) --- */}
            <div className="flex items-center gap-10 mb-12">
                
                {/* Телеграм (Send иконка) */}
                {business.telegram && (
                    <a 
                      href={`https://t.me/${business.telegram}`} 
                      target="_blank" 
                      className="text-white hover:text-gray-300 transition-transform transform hover:scale-110"
                    >
                        <Send size={32} strokeWidth={1.5} />
                    </a>
                )}
                
                {/* Инстаграм */}
                {business.instagram && (
                    <a 
                      href={`https://instagram.com/${business.instagram}`} 
                      target="_blank"
                      className="text-white hover:text-gray-300 transition-transform transform hover:scale-110"
                    >
                        <Instagram size={32} strokeWidth={1.5} />
                    </a>
                )}

            </div>
        </div>

        {/* --- СЕКЦИЯ ВИДЖЕТОВ --- */}
        <div className="flex-1 pb-12 px-4 flex flex-col gap-0">
           
           {/* 1. Кнопка О НАС (на первом месте) */}
           <AboutWidget business={business} />

           {/* 2. Кнопки ЗАПИСИ (услуги, мастера, время) */}
           <BookingWidget 
             services={business.services || []} 
             masters={masters || []} 
             businessName={business.name} 
           />

        </div>

        {/* Футер */}
        <div className="text-center text-white/20 text-[10px] uppercase tracking-[0.3em] pb-8">
          Powered by Linkalink
        </div>

      </main>
    </div>
  );
}