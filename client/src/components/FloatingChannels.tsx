/**
 * FloatingChannels — Sticky vertical channel buttons (right side)
 * Visible on all pages so users can order anytime.
 */

import { ShoppingBag, Music2, MessageCircle } from "lucide-react";
import { CHANNELS } from "@/const";

export default function FloatingChannels() {
  const items = [
    {
      label: "Shopee",
      href: CHANNELS.shopee,
      bg: "#EE4D2D",
      Icon: ShoppingBag,
    },
    {
      label: "TikTok",
      href: CHANNELS.tiktok,
      bg: "#000000",
      Icon: Music2,
    },
    {
      label: "LINE",
      href: CHANNELS.line,
      bg: "#06C755",
      Icon: MessageCircle,
    },
  ];

  return (
    <div className="fixed right-3 md:right-5 bottom-5 md:bottom-8 z-30 flex flex-col gap-2.5">
      {items.map(({ label, href, bg, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Order via ${label}`}
          style={{ background: bg }}
          className="group btn-press w-12 h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.4)] hover:scale-110 transition-transform duration-200"
        >
          <Icon size={20} />
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-md bg-[var(--wijit-deep)] text-white text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 hidden md:block">
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}
