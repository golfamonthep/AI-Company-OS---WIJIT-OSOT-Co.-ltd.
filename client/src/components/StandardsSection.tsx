/**
 * StandardsSection — Trust & Standards (UX refresh)
 * - 6-item icon grid: FDA, GMP, แพทย์พัฒนา, ผลิตในไทย, ส่งทั่วไทย, รับประกัน
 * - Dark forest background for contrast
 * - Animated reveal
 */

import { ShieldCheck, FlaskConical, Stethoscope, MapPin, Truck, RefreshCcw } from "lucide-react";
import { HERB_LINE_ART } from "@/const";

const TRUST_ITEMS = [
  {
    Icon: ShieldCheck,
    title: "อย. รับรอง",
    desc: "ผลิตภัณฑ์ทุกรายการผ่านการรับรองจาก สำนักงานคณะกรรมการอาหารและยา",
  },
  {
    Icon: FlaskConical,
    title: "GMP มาตรฐาน",
    desc: "กระบวนการผลิตตามมาตรฐาน Good Manufacturing Practice ระดับสากล",
  },
  {
    Icon: Stethoscope,
    title: "พัฒนาโดยแพทย์",
    desc: "ทีมแพทย์ผู้เชี่ยวชาญและเภสัชกรร่วมพัฒนาสูตรตำรับทุกผลิตภัณฑ์",
  },
  {
    Icon: MapPin,
    title: "ผลิตในประเทศไทย",
    desc: "โรงงานผลิตมาตรฐานตั้งอยู่ในจังหวัดชลบุรี ประเทศไทย",
  },
  {
    Icon: Truck,
    title: "จัดส่งทั่วไทย",
    desc: "บริการจัดส่งรวดเร็วทั่วประเทศผ่านช่องทางออนไลน์หลายแพลตฟอร์ม",
  },
  {
    Icon: RefreshCcw,
    title: "รับประกันคุณภาพ",
    desc: "ยินดีเปลี่ยนหรือคืนสินค้าหากไม่ได้มาตรฐาน ภายใน 7 วัน",
  },
];

export default function StandardsSection() {
  return (
    <section
      id="standards"
      className="relative py-16 md:py-28 bg-[var(--wijit-deep)] text-white overflow-hidden grain"
    >
      {/* botanical line art decoration */}
      <img
        src={HERB_LINE_ART}
        alt=""
        aria-hidden
        className="hidden lg:block absolute -right-20 top-10 w-[440px] opacity-[0.07] pointer-events-none invert"
      />

      <div className="container relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--wijit)]/80">
            03 — Standards &amp; Trust
          </span>
          <span className="h-px w-16 bg-[var(--wijit)]/50" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12 md:mb-16">
          <h2 className="font-display leading-[1.15] max-w-xl">
            มาตรฐานที่คุณ
            <br />
            <span className="text-[var(--wijit)]">วางใจได้</span>
          </h2>
          <p className="text-white/65 text-base max-w-sm leading-[1.8]">
            ทุกขั้นตอนตั้งแต่การวิจัย พัฒนาสูตร ไปจนถึงการผลิตและจัดจำหน่าย
            ดำเนินการภายใต้มาตรฐานสากลอย่างเคร่งครัด
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {TRUST_ITEMS.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className="reveal group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--wijit)]/40 transition-all duration-400"
              style={{ animationDelay: `${70 * i}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--wijit)]/15 border border-[var(--wijit)]/30 flex items-center justify-center mb-4 group-hover:bg-[var(--wijit)]/25 transition-colors">
                <Icon size={20} className="text-[var(--wijit)]" />
              </div>
              <h3 className="font-display text-white text-base font-semibold mb-2">{title}</h3>
              <p className="text-white/60 text-sm leading-[1.75]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
