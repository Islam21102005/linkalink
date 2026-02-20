"use client";

import { Flame } from "lucide-react";

export default function PromotionsWidget({ promotions }: { promotions: any[] }) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="w-full mt-4 animate-in slide-in-from-bottom duration-700">
      {/* Скролл контейнер (заголовок удален) */}
      <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory no-scrollbar">
        {promotions.map((promo, i) => (
          <div 
            key={i} 
            className={`min-w-[85%] sm:min-w-[300px] h-32 rounded-3xl p-6 text-gray-900 snap-center shadow-xl flex flex-col justify-center relative overflow-hidden bg-gradient-to-r ${promo.color || 'from-gray-900 to-black'}`}
          > 
            <div className="absolute -right-4 -bottom-8 opacity-20 rotate-12">
                <Flame size={100} />
            </div>

            <h4 className="font-black text-xl uppercase italic tracking-tighter mb-1 relative z-10 leading-none">
                {promo.title}
            </h4>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 leading-relaxed max-w-[90%] relative z-10">
                {promo.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}