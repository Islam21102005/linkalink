import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Instagram, Send, Phone } from "lucide-react"; 
import BookingWidget from "@/components/BookingWidget";
import AboutWidget from "@/components/AboutWidget";
import PromotionsWidget from "@/components/PromotionsWidget"; // 👈 Импортируем новый виджет

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !business) {
    notFound();
  }

  const { data: masters } = await supabase
    .from("masters")
    .select("*")
    .eq("business_id", business.id);

  const bgImage = business.bg_image || "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1000";
  const avatarUrl = business.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=000&color=fff`;

  return (
    <div 
      className="min-h-screen flex justify-center bg-fixed bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px] z-0"></div>

      <main className="w-full max-w-[480px] min-h-screen z-10 flex flex-col relative pt-16 px-0">
        
        {/* ПРОФИЛЬ (с отступами px-6) */}
        <div className="flex flex-col items-center text-center px-6">
            <img 
              src={avatarUrl} 
              alt={business.name} 
              className="w-32 h-32 rounded-full border-2 border-white/30 shadow-2xl object-cover mb-6" 
            />

            <h1 className="text-4xl text-white font-bold uppercase mb-2 leading-none tracking-[0.2em]">
                {business.name}
            </h1>
            
            <p className="text-white/70 text-[11px] font-medium mb-8 uppercase tracking-[0.3em]">
                Барбершоп, который слышит
            </p>

            <div className="flex items-center gap-10 mb-12">
                {business.telegram && (
                    <a href={`https://t.me/${business.telegram}`} target="_blank" className="text-white hover:text-gray-300 transition-transform hover:scale-110">
                        <Send size={30} strokeWidth={1.5} />
                    </a>
                )}
                {business.phone && (
                    <a href={`tel:${business.phone}`} className="text-white hover:text-gray-300 transition-transform hover:scale-110">
                        <Phone size={30} strokeWidth={1.5} />
                    </a>
                )}
                {business.instagram && (
                    <a href={`https://instagram.com/${business.instagram}`} target="_blank" className="text-white hover:text-gray-300 transition-transform hover:scale-110">
                        <Instagram size={30} strokeWidth={1.5} />
                    </a>
                )}
            </div>
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="flex-1 flex flex-col pb-12">
           
           {/* Кнопки (с отступами px-4) */}
           <div className="px-4 flex flex-col gap-4">
             <AboutWidget business={business} />

             <BookingWidget 
               services={business.services || []} 
               masters={masters || []} 
               businessName={business.name} 
             />
           </div>

           {/* 👇 НОВЫЙ БЛОК АКЦИЙ (без отступов, чтобы скролл уходил за край) */}
           <PromotionsWidget promotions={business.promotions} />
           
        </div>

        <div className="text-center text-white/20 text-[10px] uppercase tracking-[0.4em] pb-8">
          Powered by Linkalink
        </div>
      </main>
    </div>
  );
}