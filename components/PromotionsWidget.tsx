"use client";

import { Flame } from "lucide-react";

export default function PromotionsWidget({ promotions }: { promotions: any[] }) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="w-full mt-4">
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {promotions.map((promo, i) => (
          <div
            key={i}
            className={`min-w-[82%] sm:min-w-[290px] h-28 rounded-3xl p-5 snap-center relative overflow-hidden bg-gradient-to-r ${promo.color || "from-gray-900 to-black"}`}
            style={{ opacity: 0.82 }}
          >
            {/* Subtle glass overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
            <div className="absolute -right-3 -bottom-6 opacity-10 rotate-12">
              <Flame size={90} />
            </div>
            <div className="relative z-10">
              <h4 className="font-black text-lg uppercase italic tracking-tighter leading-tight text-white mb-1">
                {promo.title}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-relaxed max-w-[88%]">
                {promo.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}