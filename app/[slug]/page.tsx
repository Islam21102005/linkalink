import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Send, Instagram } from "lucide-react"; // Send = иконка Telegram
import BookingWidget from "@/components/BookingWidget";

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: business, error } = await supabase.from("businesses").select("*").eq("slug", slug).single();
  if (error || !business) notFound();

  const { data: masters } = await supabase.from("masters").select("*").eq("business_id", business.id);

  const bgImage = business.bg_image || "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1000";
  const avatarUrl = business.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}`;

  return (
    <div className="min-h-screen flex justify-center bg-fixed bg-cover bg-center" style={{ backgroundImage: `url('${bgImage}')` }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0"></div>

      <main className="w-full max-w-[480px] min-h-screen z-10 flex flex-col relative pt-12">
        
        {/* --- ПРОФИЛЬ (Без шапки) --- */}
        <div className="px-6 flex flex-col items-center text-center">
            <img src={avatarUrl} alt={business.name} className="w-28 h-28 rounded-full border-2 border-white/50 shadow-2xl object-cover mb-4" />

            <h1 className="text-4xl text-white font-bold tracking-wider uppercase mb-1">{business.name}</h1>
            
            {/* СЛОГАН (Описание бизнеса из базы) */}
            <p className="text-white/60 text-sm font-medium mb-6">
                {business.description || "Барбершоп, который слышит"}
            </p>

            {/* --- СОЦСЕТИ (Телеграм и Инстаграм без фона) --- */}
            <div className="flex gap-8 items-center justify-center mb-10">
                {business.telegram && (
                    <a href={`https://t.me/${business.telegram}`} target="_blank" className="text-white hover:text-gray-300 transition transform hover:scale-110">
                        <Send size={30} />
                    </a>
                )}
                {/* Если нет Инсты в базе, пока скроем, чтобы было чисто */}
                <a href="#" className="text-white hover:text-gray-300 transition transform hover:scale-110">
                    <Instagram size={30} />
                </a>
            </div>
        </div>

        {/* --- ВИДЖЕТ --- */}
        <div className="flex-1 pb-10">
           <BookingWidget services={business.services} masters={masters || []} businessName={business.name} />
        </div>

      </main>
    </div>
  );
}