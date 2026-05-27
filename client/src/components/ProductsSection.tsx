/**
 * ProductsSection — Product showcase (UX refresh)
 * - Larger product image (portrait aspect on mobile)
 * - Coloured badge per category
 * - Price + promo prominent
 * - 3-channel CTA with clear labels (44px tap targets)
 * - Benefit bullets with checkmark icons
 */

import { useState } from "react";
import { Star, ShoppingBag, Music2, MessageCircle, Facebook, Check, ChevronDown } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";

const BADGE_COLORS: Record<string, string> = {
  "2 แถม 1":    "bg-[#EE4D2D] text-white",
  "Best Seller": "bg-amber-500 text-white",
  "สูตรใหม่":   "bg-[var(--wijit-deep)] text-white",
  "Premium":     "bg-yellow-600 text-white",
  "สมุนไพรไทย": "bg-emerald-700 text-white",
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={13}
          className={i < full ? "fill-amber-400 text-amber-400" : "text-foreground/20"}
        />
      ))}
      <span className="ml-1 font-mono text-xs text-foreground/60">{rating.toFixed(1)}</span>
    </div>
  );
}

function ChannelDropdown({ channels }: { channels: { shopee: string; tiktok: string; line: string; facebook: string } }) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: "Shopee",    href: channels.shopee,   color: "bg-[#EE4D2D]",  icon: <ShoppingBag size={14} /> },
    { label: "TikTok",    href: channels.tiktok,   color: "bg-black",      icon: <Music2 size={14} /> },
    { label: "LINE",      href: channels.line,     color: "bg-[#06C755]",  icon: <MessageCircle size={14} /> },
    { label: "Facebook",  href: channels.facebook, color: "bg-[#1877F2]",  icon: <Facebook size={14} /> },
  ];

  return (
    <div className="relative mt-4">
      {/* Primary Shopee button */}
      <a
        href={channels.shopee}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-press tap-target w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--wijit-deep)] text-white font-semibold text-sm hover:bg-[var(--wijit-dark)] transition-colors shadow-[0_4px_16px_-8px_rgba(45,59,31,0.4)]"
      >
        <ShoppingBag size={16} />
        สั่งซื้อเลย
      </a>

      {/* More channels toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap-target mt-2 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm text-foreground/70 hover:border-[var(--wijit-dark)] hover:text-[var(--wijit-deep)] transition-colors"
      >
        ช่องทางอื่น
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {items.slice(1).map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn-press tap-target inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90 ${ch.color}`}
            >
              {ch.icon}
              {ch.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsSection() {
  const { products: PRODUCTS, channels: CHANNELS } = useSiteData();

  return (
    <section id="products" className="py-16 md:py-28 bg-background">
      <div className="container">
        <div className="flex items-center gap-3 mb-5">
          <span className="section-num">04 — Product Showcase</span>
          <span className="h-px w-16 bg-[var(--wijit)]" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10 md:mb-14">
          <h2 className="font-display text-[var(--wijit-deep)] leading-[1.15] max-w-2xl">
            ผลิตภัณฑ์ของเรา
            <br />
            <span className="text-foreground">คัดสรรเพื่อสุขภาพที่ดีของคุณ</span>
          </h2>
          <p className="text-foreground/70 text-base max-w-sm leading-[1.8]">
            พัฒนาสูตรร่วมกับแพทย์ผู้เชี่ยวชาญและเภสัชกร
            จำหน่ายผ่านช่องทางออนไลน์ที่หลากหลาย
          </p>
        </div>

        {/* Product grid — 1 col mobile, 2 col tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-7">
          {PRODUCTS.map((p, i) => (
            <article
              key={p.id}
              className="group bg-white border border-border rounded-2xl overflow-hidden hover:border-[var(--wijit-dark)]/40 hover:shadow-[0_24px_48px_-24px_rgba(45,59,31,0.3)] transition-all duration-500 reveal flex flex-col"
              style={{ animationDelay: `${70 * i}ms` }}
            >
              {/* Image — portrait on mobile, square on larger */}
              <div className="relative bg-[var(--cream)] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full object-cover aspect-[4/3] group-hover:scale-[1.04] transition-transform duration-700"
                />
                {p.badge && (
                  <span className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-full shadow-sm ${BADGE_COLORS[p.badge] ?? "bg-[var(--wijit-deep)] text-white"}`}>
                    {p.badge}
                  </span>
                )}
                <div className="absolute top-3 right-3">
                  <StarRating rating={p.rating} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--wijit-dark)] mb-1">
                  {p.category}
                </p>
                <h3 className="font-display text-[var(--wijit-deep)] leading-snug">
                  {p.name}
                </h3>
                <p className="text-xs text-foreground/55 mt-0.5">{p.subtitle}</p>

                <p className="mt-3 text-sm text-foreground/75 leading-[1.7] line-clamp-2">
                  {p.shortDesc}
                </p>

                {/* Benefits */}
                <ul className="mt-3 space-y-1.5">
                  {p.benefits.slice(0, 3).map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[13px] text-foreground/75">
                      <Check size={13} className="mt-[3px] text-[var(--wijit-dark)] flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="mt-auto pt-4 border-t border-border/60 mt-4">
                  <div className="font-mono text-[10px] tracking-wider uppercase text-foreground/45 mb-1">
                    {p.size}
                  </div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-2xl font-bold text-[var(--wijit-deep)]">
                      {p.price}
                    </span>
                    {p.promoPrice && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--wijit)]/15 text-[var(--wijit-deep)] text-xs font-medium">
                        {p.promoPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Channel CTA */}
                <ChannelDropdown channels={CHANNELS as { shopee: string; tiktok: string; line: string; facebook: string }} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
