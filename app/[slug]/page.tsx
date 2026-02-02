import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Instagram, Send, Phone } from "lucide-react"; 
import BookingWidget from "@/components/BookingWidget";
import GlampingWidget from "@/components/GlampingWidget"; // Импорт нового виджета
import AboutWidget from "@/components/AboutWidget";
import PromotionsWidget from "@/components/PromotionsWidget";
import TrackingSocials from "@/components/TrackingSocials";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Получаем бизнес
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !business) notFound();

  // 2. Получаем мастеров (только для салонов)
  const { data: masters } = await supabase
    .from("masters")
    .select("*")
    .eq("business_id", business.id);

  const bgImage = business.bg_image || "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1000";
  const avatarUrl = business.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}`;

  return (
    <div 
      className="min-h-screen flex justify-center bg-fixed bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px] z-0"></div>

      <main className="w-full max-w-[480px] min-h-screen z-10 flex flex-col relative pt-16 px-4">
        
        {/* ПРОФИЛЬ */}
        <div className="flex flex-col items-center text-center">
            <img 
              src={avatarUrl} 
              alt={business.name} 
              className="w-32 h-32 rounded-full border-2 border-white/30 shadow-2xl object-cover mb-6" 
            />

            <h1 className="text-4xl text-white font-bold uppercase mb-2 leading-none tracking-[0.2em]">
                {business.name}
            </h1>
            
            <p className="text-white/70 text-[11px] font-medium mb-8 uppercase tracking-[0.3em]">
                {business.description ? business.description.slice(0, 50) + "..." : "Добро пожаловать"}
            </p>

            <TrackingSocials business={business} />
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="flex-1 flex flex-col gap-4 pb-12">
           
           <AboutWidget business={business} />

           {/* 👇 ЛОГИКА ВЫБОРА ВИДЖЕТА 👇 */}
           {business.business_type === 'glamping' ? (
             <GlampingWidget 
                houses={business.services || []} // Дома храним в services
                addons={business.addons || []}   // Допы в addons
                businessName={business.name}
                managerTelegram={business.telegram}
             />
           ) : (
             <BookingWidget 
               services={business.services || []} 
               masters={masters || []} 
               businessName={business.name} 
             />
           )}

           <PromotionsWidget promotions={business.promotions} />
        </div>

        <div className="text-center text-white/20 text-[10px] uppercase tracking-[0.4em] pb-8">
          Powered by Linkalink
        </div>
      </main>
    </div>
  );
}