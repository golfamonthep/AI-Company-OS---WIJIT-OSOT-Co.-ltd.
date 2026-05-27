/**
 * AboutSection — Asymmetric editorial layout (UX refresh)
 * + Benefit bullets with check icons
 * + Accordion for progressive disclosure
 */

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { ABOUT_LAB_IMAGE } from "@/const";
import { useSiteData } from "@/hooks/useSiteData";

const BENEFITS = [
  "สูตรตำรับพัฒนาร่วมกับแพทย์ผู้เชี่ยวชาญและเภสัชกร",
  "วัตถุดิบสมุนไพรคัดสรรจากแหล่งที่ดีที่สุดในประเทศไทย",
  "ผลิตในโรงงานมาตรฐาน GMP ที่ได้รับการรับรอง",
  "ผ่านการทดสอบคุณภาพและความปลอดภัยทุกล็อตการผลิต",
  "มีผลิตภัณฑ์ครอบคลุมทั้งยา อาหารเสริม และวิตามิน",
];

const ACCORDION_ITEMS = [
  {
    title: "พันธกิจของเรา",
    body: "มุ่งมั่นพัฒนาผลิตภัณฑ์สมุนไพรไทยและอาหารเสริมคุณภาพสูง เพื่อส่งเสริมสุขภาพที่ดีของคนไทยและสร้างความเชื่อมั่นในภูมิปัญญาสมุนไพรไทยสู่ระดับสากล",
  },
  {
    title: "วิสัยทัศน์",
    body: "เป็นผู้นำด้านผลิตภัณฑ์สมุนไพรไทยที่ได้รับความไว้วางใจจากผู้บริโภคทั่วประเทศ ด้วยมาตรฐานการผลิตระดับสากลและนวัตกรรมที่ไม่หยุดนิ่ง",
  },
  {
    title: "คุณค่าที่เราให้",
    body: "ความซื่อสัตย์ในการผลิต ความใส่ใจในคุณภาพ และความรับผิดชอบต่อสุขภาพของลูกค้าทุกคน คือหัวใจสำคัญที่ขับเคลื่อนทุกการตัดสินใจของเรา",
  },
];

function AccordionItem({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap-target w-full flex items-center justify-between py-4 text-left font-semibold text-[var(--wijit-deep)] hover:text-[var(--wijit-dark)] transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm md:text-base">{title}</span>
        <ChevronDown
          size={17}
          className={`flex-shrink-0 text-[var(--wijit-dark)] transition-transform duration-250 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-foreground/70 leading-[1.8] pr-6">
          {body}
        </p>
      )}
    </div>
  );
}

export default function AboutSection() {
  const { company: COMPANY } = useSiteData();
  return (
    <section id="about" className="relative py-20 md:py-28 bg-[var(--cream)] grain">
      <div className="container relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="section-num">02 — About Us</span>
          <span className="h-px w-16 bg-[var(--wijit)]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* image left */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              <div className="overflow-hidden rounded-md shadow-[0_24px_60px_-30px_rgba(45,59,31,0.4)]">
                <img
                  src={ABOUT_LAB_IMAGE}
                  alt="ห้องปฏิบัติการสมุนไพรของวิจิตรโอสถ"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -right-4 -bottom-4 bg-white border border-border rounded-md px-5 py-4 shadow-lg max-w-[230px]">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--wijit-dark)]">
                  Quality Control
                </div>
                <div className="mt-1 font-display font-semibold text-sm text-[var(--wijit-deep)] leading-snug">
                  ตรวจสอบคุณภาพในทุกขั้นตอนการผลิต
                </div>
              </div>
            </div>
          </div>

          {/* copy right */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--wijit-deep)] leading-[1.15]">
              ภูมิปัญญาสมุนไพรไทย
              <br />
              <span className="text-foreground">ภายใต้มาตรฐานเภสัชสมัยใหม่</span>
            </h2>

            <div className="mt-6 md:mt-8 space-y-5 text-foreground/80 text-base md:text-[17px] leading-[1.85]">
              <p>
                {COMPANY.nameTh} ก่อตั้งขึ้นเพื่อสานต่อภูมิปัญญาสมุนไพรไทยให้กับคนยุคใหม่
                ด้วยการพัฒนาตำรับร่วมกับแพทย์ผู้เชี่ยวชาญและเภสัชกร
                เพื่อให้ผลิตภัณฑ์ทุกชิ้นเชื่อถือได้ ปลอดภัย
                และให้ผลลัพธ์ที่สัมผัสได้จริง
              </p>
            </div>

            {/* Benefit bullets */}
            <ul className="mt-5 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="mt-[3px] w-5 h-5 rounded-full bg-[var(--wijit)]/20 border border-[var(--wijit)]/40 flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-[var(--wijit-deep)]" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Accordion */}
            <div className="mt-7 bg-white rounded-2xl border border-border p-5 shadow-sm">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--wijit-dark)] mb-2">
                เรียนรู้เพิ่มเติม
              </p>
              {ACCORDION_ITEMS.map((item) => (
                <AccordionItem key={item.title} {...item} />
              ))}
            </div>

            {/* values card — แทนที่ข้อมูลทะเบียนด้วยหลักการของแบรนด์ */}
            <div className="mt-8 md:mt-10 grid grid-cols-2 gap-4 md:gap-6 border-t border-[var(--wijit-deep)]/10 pt-6">
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                  หลักการที่ 01
                </div>
                <div className="mt-1 text-sm md:text-base text-[var(--wijit-deep)] font-semibold leading-snug">
                  คัดสรรวัตถุดิบต้นตำรับจากแหล่งปลูกที่ตรวจสอบได้
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                  หลักการที่ 02
                </div>
                <div className="mt-1 text-sm md:text-base text-[var(--wijit-deep)] font-semibold leading-snug">
                  พัฒนาสูตรร่วมกับแพทย์และเภสัชกร
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                  หลักการที่ 03
                </div>
                <div className="mt-1 text-sm md:text-base text-[var(--wijit-deep)] font-semibold leading-snug">
                  ผลิตในโรงงานมาตรฐาน GMP ของไทย
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                  หลักการที่ 04
                </div>
                <div className="mt-1 text-sm md:text-base text-[var(--wijit-deep)] font-semibold leading-snug">
                  รับผิดชอบตลอดการจัดจำหน่ายถึงมือลูกค้า
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
