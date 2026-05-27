/**
 * ContactSection — Editorial contact information block with map link
 */

import { Phone, Mail, MapPin, Clock, ShieldCheck, Truck, Award } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";

const TRUST_BADGES = [
  { Icon: ShieldCheck, label: "ร้านขายยาที่ได้รับอนุญาต", sub: "ดำเนินการโดยเภสัชกรผู้มีใบอนุญาต" },
  { Icon: Truck, label: "จัดส่งทั่วประเทศไทย", sub: "ผ่าน Shopee, TikTok Shop และ LINE" },
  { Icon: Award, label: "รับประกันคุณภาพ 7 วัน", sub: "ยินดีเปลี่ยน/คืนสินค้าหากไม่ได้มาตรฐาน" },
];

export default function ContactSection() {
  const { company: COMPANY } = useSiteData();
  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="flex items-center gap-3 mb-6">
          <span className="section-num">06 — Contact</span>
          <span className="h-px w-16 bg-[var(--wijit)]" />
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {TRUST_BADGES.map(({ Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 bg-[var(--wijit)]/8 border border-[var(--wijit)]/20 rounded-xl px-4 py-3">
              <Icon size={18} className="text-[var(--wijit-dark)] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[var(--wijit-deep)]">{label}</p>
                <p className="text-[11px] text-foreground/60 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
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
