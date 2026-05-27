/**
 * Hero — Split asymmetric editorial layout
 * Modern Clinical Apothecary aesthetic.
 * Left: oversized serif Thai headline + supporting copy + dual CTA + mono trust line.
 * Right: editorial product/herbs photograph in a "pharmacy filing card" frame.
 */

import { ArrowRight, ShieldCheck } from "lucide-react";
import { CHANNELS, HERO_IMAGE, COMPANY } from "@/const";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden"
    >
      {/* very subtle sage wash on right column for depth */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[var(--sage)]/40 via-[var(--sage)]/10 to-transparent pointer-events-none"
      />

      <div className="container relative">
        {/* tiny editorial number eyebrow */}
        <div className="reveal flex items-center gap-3 mb-6 md:mb-8">
          <span className="section-num">01 — Heritage of Care</span>
          <span className="h-px w-16 bg-[var(--wijit)]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT: copy */}
          <div className="lg:col-span-7 reveal">
            <h1 className="font-display text-[40px] sm:text-5xl md:text-6xl lg:text-[72px] leading-[1.05] font-bold text-[var(--wijit-deep)]">
              สมุนไพรไทย
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">ที่แพทย์</span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-3 md:h-4 bg-[var(--wijit)]/40 -z-0"
                />
              </span>
              <span className="text-foreground"> เลือกใช้</span>
            </h1>

            <p className="mt-6 md:mt-8 max-w-2xl text-base md:text-lg text-foreground/75 leading-[1.8]">
              {COMPANY.nameTh} ผู้พัฒนาและจัดจำหน่ายผลิตภัณฑ์อาหารเสริม ยา
              วิตามิน และผลิตภัณฑ์สมุนไพรไทย
              ภายใต้การดูแลของแพทย์ผู้เชี่ยวชาญและเภสัชกร
              เพื่อสุขภาพที่ดีอย่างยั่งยืนของคุณและครอบครัว
            </p>

            <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-3 md:gap-4">
              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-press group inline-flex items-center gap-2 px-6 md:px-7 py-3 md:py-3.5 rounded-full bg-[var(--wijit-deep)] text-white font-semibold text-sm md:text-base hover:bg-[var(--wijit-dark)] transition-colors shadow-[0_8px_24px_-12px_rgba(45,59,31,0.45)]"
              >
                ดูผลิตภัณฑ์ทั้งหมด
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
              <a
                href={CHANNELS.shopee}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center gap-2 px-6 md:px-7 py-3 md:py-3.5 rounded-full border border-[var(--wijit-deep)]/20 bg-white text-[var(--wijit-deep)] font-semibold text-sm md:text-base hover:border-[var(--wijit-deep)] hover:bg-[var(--sage)]/40 transition-all"
              >
                สั่งซื้อบน Shopee
              </a>
            </div>

            <div className="mt-10 md:mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs md:text-sm">
              <div className="flex items-center gap-2 text-foreground/70">
                <ShieldCheck size={16} className="text-[var(--wijit-dark)]" />
                <span className="font-mono tracking-wider">
                  ร้านขายยาที่ได้รับอนุญาต
                </span>
              </div>
              <div className="hidden sm:block h-3.5 w-px bg-border" />
              <div className="text-foreground/70 font-mono tracking-wider">
                CHONBURI · THAILAND
              </div>
            </div>
          </div>

          {/* RIGHT: hero image card */}
          <div className="lg:col-span-5 reveal" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              {/* filing-card style border */}
              <div className="relative bg-white rounded-[8px] p-3 md:p-4 shadow-[0_24px_60px_-30px_rgba(45,59,31,0.35)] border border-border">
                <div className="overflow-hidden rounded-[4px]">
                  <img
                    src={HERO_IMAGE}
                    alt="สมุนไพรไทย ขมิ้นชัน ขิง งาดำ — ส่วนผสมหลักของผลิตภัณฑ์วิจิตรโอสถ"
                    className="w-full h-auto block"
                    loading="eager"
                  />
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-foreground/60 uppercase">
                    Plate 01 — Materia Medica
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--wijit-dark)] uppercase">
                    THAI HERBAL
                  </span>
                </div>
              </div>

              {/* floating credential card */}
              <div className="hidden md:flex absolute -left-8 -bottom-8 bg-[var(--wijit-deep)] text-white rounded-md px-5 py-4 shadow-xl flex-col gap-1 max-w-[220px]">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-75">
                  Verified
                </span>
                <span className="font-display text-base font-semibold leading-snug">
                  ร้านขายยาโดยแพทย์ผู้เชี่ยวชาญ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* bottom rail of mini stats */}
        <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 border-t border-border pt-8">
          {[
            { k: "พัฒนาโดย", v: "แพทย์ + เภสัชกร" },
            { k: "ฐานการผลิต", v: "ชลบุรี ประเทศไทย" },
            { k: "คะแนนรีวิวเฉลี่ย", v: "4.8 / 5.0" },
            { k: "ช่องทางจำหน่าย", v: "Shopee · TikTok · LINE" },
          ].map((s) => (
            <div key={s.k}>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                {s.k}
              </div>
              <div className="mt-1 font-display font-semibold text-base md:text-lg text-[var(--wijit-deep)]">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
