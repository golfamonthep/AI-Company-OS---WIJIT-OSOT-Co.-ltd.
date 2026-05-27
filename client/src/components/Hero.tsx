/**
 * Hero — Mobile-first split layout
 * UX improvements: quick-action chips, trust pills, clearer CTA hierarchy,
 * better mobile proportions (portrait image ratio on small screens).
 */

import { ArrowRight, ShieldCheck, Truck, Star, Phone } from "lucide-react";
import { HERO_IMAGE } from "@/const";
import { useSiteData } from "@/hooks/useSiteData";

export default function Hero() {
  const { company: COMPANY, channels: CHANNELS } = useSiteData();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      className="relative pt-24 md:pt-36 pb-12 md:pb-24 overflow-hidden"
    >
      {/* Background wash */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-bl from-[var(--sage)]/50 via-[var(--sage)]/15 to-transparent pointer-events-none"
      />

      <div className="container relative">
        {/* Eyebrow */}
        <div className="reveal flex items-center gap-3 mb-5 md:mb-8">
          <span className="section-num">01 — Heritage of Care</span>
          <span className="h-px w-12 bg-[var(--wijit)]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT: copy */}
          <div className="lg:col-span-7 reveal">
            <h1 className="font-display text-[var(--wijit-deep)]">
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

            <p className="mt-4 md:mt-6 max-w-xl text-base md:text-lg text-foreground/75 leading-[1.8]">
              {COMPANY.nameTh} ผู้พัฒนาและจัดจำหน่ายผลิตภัณฑ์อาหารเสริม ยา
              วิตามิน และสมุนไพรไทย ภายใต้การดูแลของแพทย์ผู้เชี่ยวชาญและเภสัชกร
            </p>

            {/* Trust pills row */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="trust-pill">
                <ShieldCheck size={13} />
                อย. รับรอง
              </span>
              <span className="trust-pill">
                <Star size={13} className="fill-[var(--wijit-dark)] text-[var(--wijit-dark)]" />
                รีวิว 4.8 / 5.0
              </span>
              <span className="trust-pill">
                <Truck size={13} />
                จัดส่งทั่วไทย
              </span>
              <span className="trust-pill">
                <ShieldCheck size={13} />
                GMP มาตรฐาน
              </span>
            </div>

            {/* Primary CTAs */}
            <div className="mt-7 md:mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={() => scrollTo("products")}
                className="btn-press tap-target group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--wijit-deep)] text-white font-semibold text-sm md:text-base hover:bg-[var(--wijit-dark)] transition-colors shadow-[0_8px_24px_-12px_rgba(45,59,31,0.45)]"
              >
                ดูผลิตภัณฑ์ทั้งหมด
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <a
                href={CHANNELS.shopee}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press tap-target inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--wijit-deep)]/20 bg-white text-[var(--wijit-deep)] font-semibold text-sm md:text-base hover:border-[var(--wijit-deep)] hover:bg-[var(--sage)]/40 transition-all"
              >
                สั่งซื้อบน Shopee
              </a>
            </div>

            {/* Quick-action chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => scrollTo("products")} className="chip">
                🌿 ผลิตภัณฑ์ยอดนิยม
              </button>
              <a href={CHANNELS.tiktok} target="_blank" rel="noopener noreferrer" className="chip">
                🎬 รีวิว TikTok
              </a>
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="chip">
                <Phone size={13} />
                ปรึกษาฟรี
              </a>
              <button onClick={() => scrollTo("channels")} className="chip">
                🛒 ช่องทางสั่งซื้อ
              </button>
            </div>
          </div>

          {/* RIGHT: hero image */}
          <div className="lg:col-span-5 reveal" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              <div className="relative bg-white rounded-[10px] p-3 md:p-4 shadow-[0_24px_60px_-30px_rgba(45,59,31,0.35)] border border-border">
                <div className="overflow-hidden rounded-[6px]">
                  <img
                    src={HERO_IMAGE}
                    alt="สมุนไพรไทย ขมิ้นชัน ขิง งาดำ — ส่วนผสมหลักของผลิตภัณฑ์วิจิตรโอสถ"
                    className="w-full object-cover aspect-[4/3] md:aspect-[3/2] block"
                    loading="eager"
                  />
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-foreground/60 uppercase">
                    Materia Medica — Thai Herbal
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--wijit-dark)] uppercase">
                    WIJITOSOT
                  </span>
                </div>
              </div>

              {/* Floating credential card — desktop only */}
              <div className="hidden md:flex absolute -left-8 -bottom-8 bg-[var(--wijit-deep)] text-white rounded-xl px-5 py-4 shadow-xl flex-col gap-1 max-w-[220px]">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
                  Verified Pharmacy
                </span>
                <span className="font-display text-sm font-semibold leading-snug">
                  ร้านขายยาโดยแพทย์ผู้เชี่ยวชาญ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rail */}
        <div className="mt-14 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 border-t border-border pt-8">
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
