/**
 * StandardsSection — Trust badges in editorial filing-card style
 * Each card uses pharmacy "Rx tag" aesthetic with mono code + serif label.
 */

import { STANDARDS, HERB_LINE_ART } from "@/const";

export default function StandardsSection() {
  return (
    <section
      id="standards"
      className="relative py-20 md:py-28 bg-[var(--wijit-deep)] text-white overflow-hidden"
    >
      {/* botanical line art decoration */}
      <img
        src={HERB_LINE_ART}
        alt=""
        aria-hidden
        className="hidden lg:block absolute -right-20 top-10 w-[440px] opacity-[0.07] pointer-events-none invert"
      />

      <div className="container relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <span
            className="section-num"
            style={{ color: "var(--wijit)" }}
          >
            03 — Quality Standards
          </span>
          <span className="h-px w-16 bg-[var(--wijit)]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12 md:mb-16">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15]">
              เราเชื่อว่าความน่าเชื่อถือ
              <br />
              <span className="text-[var(--wijit)]">เริ่มต้นจากมาตรฐาน</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-white/75 text-base md:text-lg leading-[1.85]">
              ทุกผลิตภัณฑ์ของวิจิตรโอสถ
              ผ่านกระบวนการคัดสรร พัฒนา ทดสอบ และผลิตในโรงงานที่ได้รับการรับรองมาตรฐาน
              เพื่อให้ผู้ใช้มั่นใจในประสิทธิภาพและความปลอดภัยทุกครั้ง
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STANDARDS.map((s, i) => (
            <article
              key={s.code}
              className="group relative bg-white/[0.04] backdrop-blur border border-white/10 rounded-md p-6 md:p-7 hover:bg-white/[0.07] hover:border-[var(--wijit)]/50 transition-all duration-300 reveal"
              style={{ animationDelay: `${80 * i}ms` }}
            >
              {/* corner code chip */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--wijit)] uppercase">
                  No. 0{i + 1}
                </span>
                <span className="font-mono text-xs font-semibold text-white/90 px-2 py-1 border border-white/20 rounded">
                  {s.code}
                </span>
              </div>

              <h3 className="font-display text-xl md:text-[22px] font-semibold leading-snug">
                {s.label}
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-[1.75]">
                {s.desc}
              </p>

              <div
                aria-hidden
                className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--wijit)]/60 to-transparent scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-500"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
