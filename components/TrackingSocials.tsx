"use client";

import { useEffect } from "react";
import { Instagram, Send, Phone } from "lucide-react";

interface Props {
  business: any;
}

export default function TrackingSocials({ business }: Props) {
  
  // Функция отправки события
  const track = (event: string) => {
    fetch('/api/track', {
      method: 'POST',
      body: JSON.stringify({ slug: business.slug, event }),
    });
  };

  // Отслеживаем просмотр страницы при загрузке
  useEffect(() => {
    track('view');
  }, []);

  return (
    <div className="flex items-center gap-10 mb-12">
      {business.telegram && (
        <a 
          href={`https://t.me/${business.telegram}`} 
          target="_blank" 
          onClick={() => track('click_telegram')}
          className="text-gray-900 hover:text-gray-300 transition-transform hover:scale-110"
        >
          <Send size={30} strokeWidth={1.5} />
        </a>
      )}

      {business.phone && (
        <a 
          href={`tel:${business.phone}`} 
          onClick={() => track('click_phone')}
          className="text-gray-900 hover:text-gray-300 transition-transform hover:scale-110"
        >
          <Phone size={30} strokeWidth={1.5} />
        </a>
      )}

      {business.instagram && (
        <a 
          href={`https://instagram.com/${business.instagram}`} 
          target="_blank" 
          onClick={() => track('click_instagram')}
          className="text-gray-900 hover:text-gray-300 transition-transform hover:scale-110"
        >
          <Instagram size={30} strokeWidth={1.5} />
        </a>
      )}
    </div>
  );
}