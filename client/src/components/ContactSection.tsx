/**
 * ContactSection — Editorial contact information block with map link
 */

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { COMPANY } from "@/const";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="flex items-center gap-3 mb-6">
          <span className="section-num">06 — Contact</span>
          <span className="h-px w-16 bg-[var(--wijit)]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--wijit-deep)] leading-[1.15]">
              ติดต่อเรา
              <br />
              <span className="text-foreground">เพื่อสอบถามและสั่งซื้อ</span>
            </h2>
            <p className="mt-6 text-foreground/75 text-base md:text-lg leading-[1.85]">
              ทีมงานของเราพร้อมให้คำปรึกษาเรื่องสุขภาพและแนะนำผลิตภัณฑ์ที่เหมาะกับคุณ
              เปิดดำเนินการทุกวัน ผ่านช่องทางออนไลน์
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            <ContactCard
              Icon={Phone}
              label="โทรศัพท์"
              value={COMPANY.phoneDisplay}
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
            />
            <ContactCard
              Icon={Mail}
              label="อีเมล"
              value={COMPANY.email}
              href={`mailto:${COMPANY.email}`}
            />
            <ContactCard
              Icon={MapPin}
              label="ที่ตั้งบริษัท"
              value={COMPANY.address}
              href={COMPANY.mapUrl}
              full
            />
            <ContactCard
              Icon={Clock}
              label="เวลาให้บริการ"
              value="เปิดบริการทุกวัน ผ่านช่องทางออนไลน์"
              full
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  Icon,
  label,
  value,
  href,
  full,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
  full?: boolean;
}) {
  const Comp = href ? "a" : "div";
  return (
    <Comp
      {...(href
        ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: "noopener noreferrer" }
        : {})}
      className={`block bg-white border border-border rounded-md p-5 md:p-6 hover:border-[var(--wijit-dark)]/40 hover:bg-[var(--cream)]/50 transition-all duration-300 ${full ? "sm:col-span-2" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="bg-[var(--sage)] rounded-md p-2.5 text-[var(--wijit-deep)]">
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55">
            {label}
          </div>
          <div className="mt-1 font-display text-base md:text-lg font-semibold text-[var(--wijit-deep)] leading-snug">
            {value}
          </div>
        </div>
      </div>
    </Comp>
  );
}
