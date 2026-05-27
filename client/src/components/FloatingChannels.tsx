/**
 * FloatingChannels — Sticky CTA rail (UX refresh)
 * - Added Facebook shortcut
 * - Always-visible text label on all sizes
 * - ≥44px tap targets
 */

import { ShoppingBag, Music2, MessageCircle, Facebook } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";

export default function FloatingChannels() {
  const { channels: CHANNELS } = useSiteData();

  const items = [
    { label: "Shopee",   href: CHANNELS.shopee,   bg: "#EE4D2D", hoverBg: "#d8431f", Icon: ShoppingBag },
    { label: "TikTok",   href: CHANNELS.tiktok,   bg: "#111111", hoverBg: "#333333", Icon: Music2 },
    { label: "LINE",     href: CHANNELS.line,     bg: "#06C755", hoverBg: "#05a847", Icon: MessageCircle },
    { label: "Facebook", href: CHANNELS.facebook, bg: "#1877F2", hoverBg: "#1464d8", Icon: Facebook },
  ];

  return (
    <div
      className="fixed right-3 md:right-5 bottom-5 md:bottom-8 z-30 flex flex-col gap-2.5"
      role="complementary"
      aria-label="ช่องทางสั่งซื้อด่วน"
    >
      {items.map(({ label, href, bg, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`สั่งซื้อผ่าน ${label}`}
          style={{ background: bg }}
          className="btn-press group flex items-center gap-2 pl-3 pr-4 rounded-full text-white text-xs font-semibold shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] hover:opacity-90 transition-opacity duration-200"
          /* ≥44px tap target */
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = ""; }}
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{ minWidth: 36, minHeight: 44 }}
          >
            <Icon size={18} />
          </span>
          <span className="whitespace-nowrap">{label}</span>
        </a>
      ))}
    </div>
  );
}
