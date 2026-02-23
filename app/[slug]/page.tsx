import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import BookingWidget from "@/components/BookingWidget";
import GlampingWidget from "@/components/GlampingWidget";
import RentalWidget from "@/components/RentalWidget";
import AboutWidget from "@/components/AboutWidget";
import PromotionsWidget from "@/components/PromotionsWidget";
import TrackingSocials from "@/components/TrackingSocials";

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

  if (error || !business) notFound();

  const [servicesRes, mastersRes, addonsRes] = await Promise.all([
    supabase.from("services").select("*").eq("business_id", business.id).order("sort_order"),
    supabase.from("masters").select("*").eq("business_id", business.id).order("sort_order"),
    supabase.from("addons").select("*").eq("business_id", business.id).order("sort_order"),
  ]);

  const services = servicesRes.data || [];
  const masters = mastersRes.data || [];
  const addons = addonsRes.data || [];

  const bgImage = business.bg_image || "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1000";
  const avatarUrl = business.logo_url || business.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=000000&color=ffffff`;

  const isGlamping = business.business_type === "glamping";
  const isRental = business.business_type === "rental";
  const isService = !isGlamping && !isRental;

  return (
    <div
      className="min-h-screen flex justify-center bg-fixed bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm z-0" />

      <main className="w-full max-w-md min-h-screen z-10 flex flex-col relative pt-16 px-4">
        {/* PROFILE */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={avatarUrl}
            alt={business.name}
            className="w-32 h-32 rounded-full border-2 border-white/30 shadow-2xl object-cover mb-6"
          />
          <h1 className="text-4xl text-white font-bold uppercase mb-2 leading-none tracking-widest">
            {business.name}
          </h1>
          <p className="text-white/70 text-sm font-medium mb-6 uppercase tracking-widest">
            {business.short_description || (business.description ? business.description.slice(0, 60) : "Добро пожаловать")}
          </p>
          <TrackingSocials business={business} />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-4 pb-12">
          <AboutWidget business={business} />

          {/* BOOKING WIDGET BASED ON BUSINESS TYPE */}
          {isGlamping && (
            <GlampingWidget
              houses={services}
              addons={addons}
              businessName={slug}
              managerTelegram={business.manager_telegram || business.telegram || ""}
            />
          )}

          {isRental && (
            <RentalWidget
              spaces={services}
              businessName={slug}
            />
          )}

          {isService && (
            <BookingWidget
              services={services}
              masters={masters}
              businessName={slug}
            />
          )}

          {/* ADDONS INFO SECTION (for service businesses with addon details) */}
          {isService && addons.filter((a: any) => a.show_details && a.is_active !== false).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-white/60 text-xs uppercase tracking-widest font-bold text-center">Дополнительные услуги</h2>
              {addons.filter((a: any) => a.show_details && a.is_active !== false).map((addon: any) => (
                <AddonCard key={addon.id} addon={addon} />
              ))}
            </div>
          )}

          <PromotionsWidget promotions={business.promotions} />
        </div>

        <div className="text-center pb-8 flex flex-col items-center gap-3">
          <a
            href={`https://t.me/linkalink_notify_bot?start=${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/50 hover:text-white/80 hover:border-white/40 transition-all text-xs font-medium"
          >
            📣 Подписаться на уведомления
          </a>
          <p className="text-white/20 text-xs uppercase tracking-widest">Powered by Linkalink</p>
        </div>
      </main>
    </div>
  );
}

function AddonCard({ addon }: { addon: any }) {
  const photos: string[] = addon.photos || [];
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
      {photos.length > 0 && (
        <div className="h-40 overflow-hidden">
          <img src={photos[0]} alt={addon.name} className="w-full h-full object-cover" />
        </div>
      )}
      {addon.video_url && (
        <div className="h-40">
          <iframe src={addon.video_url} className="w-full h-full" allowFullScreen />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-white font-bold">{addon.name}</h3>
            {addon.description && <p className="text-white/60 text-xs mt-1">{addon.description}</p>}
          </div>
          {addon.price > 0 && (
            <span className="text-white font-black text-lg shrink-0">
              {Number(addon.price).toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
      </div>
    </div>
  );
}