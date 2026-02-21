"use client";

import { useEffect } from "react";
import { Instagram, Send, Phone, MessageCircle } from "lucide-react";

interface Props {
  business: any;
}

function getSocialIcon(type: string, size = 28) {
  switch (type) {
    case "instagram": return <Instagram size={size} strokeWidth={1.5} />;
    case "telegram":  return <Send size={size} strokeWidth={1.5} />;
    case "whatsapp":  return <MessageCircle size={size} strokeWidth={1.5} />;
    case "phone":     return <Phone size={size} strokeWidth={1.5} />;
    default:          return <Phone size={size} strokeWidth={1.5} />;
  }
}

function getSocialHref(type: string, url: string): string {
  if (!url) return "#";
  switch (type) {
    case "instagram":
      return url.startsWith("http") ? url : `https://instagram.com/${url.replace(/^@/, "")}`;
    case "telegram":
      return url.startsWith("http") ? url : `https://t.me/${url.replace(/^@/, "")}`;
    case "whatsapp": {
      const digits = url.replace(/\D/g, "");
      return `https://wa.me/${digits}`;
    }
    case "phone": {
      const digits = url.replace(/\D/g, "");
      return `tel:+${digits}`;
    }
    default:
      return url.startsWith("http") ? url : `https://${url}`;
  }
}

export default function TrackingSocials({ business }: Props) {
  const track = (event: string) => {
    fetch("/api/track", {
      method: "POST",
      body: JSON.stringify({ slug: business.slug, event }),
    });
  };

  useEffect(() => {
    track("view");
  }, []);

  // Основной формат: social_links — массив [{type, url, label}]
  const socialLinks: { type: string; url: string; label?: string }[] =
    Array.isArray(business.social_links) ? business.social_links : [];

  // Обратная совместимость с устаревшими полями
  const legacyLinks: { type: string; url: string }[] = [];
  if (business.telegram && !socialLinks.find((s: any) => s.type === "telegram"))
    legacyLinks.push({ type: "telegram", url: business.telegram });
  if (business.phone && !socialLinks.find((s: any) => s.type === "phone"))
    legacyLinks.push({ type: "phone", url: business.phone });
  if (business.instagram && !socialLinks.find((s: any) => s.type === "instagram"))
    legacyLinks.push({ type: "instagram", url: business.instagram });

  const allLinks = [...socialLinks, ...legacyLinks].filter((l: any) => l.url);

  if (allLinks.length === 0) return null;

  return (
    <div className="flex items-center gap-8 mb-12 flex-wrap justify-center">
      {allLinks.map((link: any, i: number) => (
        <a
          key={i}
          href={getSocialHref(link.type, link.url)}
          target={link.type !== "phone" ? "_blank" : undefined}
          rel="noopener noreferrer"
          onClick={() => track(`click_${link.type}`)}
          className="flex flex-col items-center gap-1.5 text-white hover:text-white/70 transition-all hover:scale-110"
        >
          {getSocialIcon(link.type)}
          {link.label && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
              {link.label}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
