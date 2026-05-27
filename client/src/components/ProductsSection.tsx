/**
 * ProductsSection — Product showcase with multi-channel purchase buttons
 * Each card uses prescription-tag style with mono register code + serif name.
 * Channel buttons: Shopee (orange), TikTok (black/pink), LINE (green).
 */

import { Star, ShoppingBag, Music2, MessageCircle } from "lucide-react";
import { PRODUCTS, CHANNELS } from "@/const";

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i < full
              ? "fill-[var(--wijit-dark)] text-[var(--wijit-dark)]"
              : "text-foreground/20"
          }
        />
      ))}
      <span className="ml-1.5 font-mono text-xs text-foreground/60">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function ProductsSection() {
  return (
    <section id="products" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="flex items-center gap-3 mb-6">
          <span className="section-num">04 — Product Showcase</span>
          <span className="h-px w-16 bg-[var(--wijit)]" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 md:mb-14">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--wijit-deep)] leading-[1.15] max-w-3xl">
            ผลิตภัณฑ์ของเรา
            <br />
            <span className="text-foreground">คัดสรรเพื่อสุขภาพที่ดีของคุณ</span>
          </h2>
          <p className="text-foreground/70 text-base md:text-lg max-w-md leading-[1.8]">
            ผลิตภัณฑ์อาหารเสริมและสมุนไพรที่พัฒนาสูตรร่วมกับแพทย์ผู้เชี่ยวชาญ
            พร้อมจำหน่ายผ่านช่องทางออนไลน์ที่หลากหลาย
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {PRODUCTS.map((p, i) => (
            <article
              key={p.id}
              className="group bg-white border border-border rounded-lg overflow-hidden hover:border-[var(--wijit-dark)]/40 hover:shadow-[0_30px_60px_-30px_rgba(45,59,31,0.35)] transition-all duration-500 reveal"
              style={{ animationDelay: `${80 * i}ms` }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-5">
                {/* image */}
                <div className="sm:col-span-2 relative bg-[var(--cream)] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover aspect-square sm:aspect-auto group-hover:scale-[1.04] transition-transform duration-700"
                  />
                  {p.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-[var(--wijit-deep)] text-white text-[10px] font-mono tracking-[0.18em] uppercase rounded">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* content */}
                <div className="sm:col-span-3 p-5 md:p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--wijit-dark)]">
                      RX · {p.id.toUpperCase()}
                    </span>
                    <StarRating rating={p.rating} />
                  </div>

                  <h3 className="font-display text-xl md:text-[22px] font-bold text-[var(--wijit-deep)] leading-tight">
                    {p.name}
                  </h3>
                  <p className="font-mono text-[11px] tracking-wider uppercase text-foreground/55 mt-1">
                    {p.subtitle}
                  </p>

                  <p className="mt-3 text-sm text-foreground/75 leading-[1.7]">
                    {p.shortDesc}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {p.benefits.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-[13px] text-foreground/75"
                      >
                        <span className="mt-[7px] h-1 w-1 rounded-full bg-[var(--wijit-dark)] flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-5 flex items-end justify-between border-t border-border/60 mt-5">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                        {p.size}
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-[var(--wijit-deep)]">
                          {p.price}
                        </span>
                        {p.promoPrice && (
                          <span className="font-mono text-xs text-foreground/55">
                            {p.promoPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* channel buttons */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <a
                      href={CHANNELS.shopee}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-press inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-[#EE4D2D] text-white text-xs font-semibold hover:bg-[#d8431f] transition-colors"
                    >
                      <ShoppingBag size={14} />
                      Shopee
                    </a>
                    <a
                      href={CHANNELS.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-press inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                    >
                      <Music2 size={14} />
                      TikTok
                    </a>
                    <a
                      href={CHANNELS.line}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-press inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-[#06C755] text-white text-xs font-semibold hover:bg-[#05a847] transition-colors"
                    >
                      <MessageCircle size={14} />
                      LINE
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
