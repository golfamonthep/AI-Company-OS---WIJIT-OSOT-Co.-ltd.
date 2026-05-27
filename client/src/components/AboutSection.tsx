/**
 * AboutSection — Asymmetric editorial layout
 * Right-aligned image + left textual narrative + sidebar pull-quote.
 */

import { ABOUT_LAB_IMAGE, COMPANY } from "@/const";

export default function AboutSection() {
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
              <p>
                เรามุ่งคัดเลือกวัตถุดิบสมุนไพรไทยจากแหล่งปลูกที่ตรวจสอบได้
                ผ่านกระบวนการสกัดและผลิตในโรงงานมาตรฐาน
                เพื่อให้ร่างกายดูดซึมไปใช้ได้อย่างมีประสิทธิภาพ
                ลดการอักเสบ และฟื้นฟูจากภายในอย่างยั่งยืน
              </p>
            </div>

            {/* registration card */}
            <div className="mt-8 md:mt-10 grid grid-cols-2 gap-4 md:gap-6 border-t border-[var(--wijit-deep)]/10 pt-6">
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                  เลขทะเบียนนิติบุคคล
                </div>
                <div className="mt-1 font-mono text-sm md:text-base text-[var(--wijit-deep)] font-semibold">
                  {COMPANY.registrationNo}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                  วันที่จดทะเบียน
                </div>
                <div className="mt-1 font-mono text-sm md:text-base text-[var(--wijit-deep)] font-semibold">
                  {COMPANY.registeredOn}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                  ทุนจดทะเบียน
                </div>
                <div className="mt-1 font-mono text-sm md:text-base text-[var(--wijit-deep)] font-semibold">
                  {COMPANY.capital}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                  หมวดธุรกิจ
                </div>
                <div className="mt-1 text-sm md:text-base text-[var(--wijit-deep)] font-medium leading-snug">
                  เภสัชภัณฑ์และทางการแพทย์
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
