/**
 * ChannelsSection — Multi-channel order section
 * Highlights: Shopee, TikTok Shop, LINE, Facebook
 * Each channel becomes a large clickable card.
 */

import {
  ShoppingBag,
  Music2,
  MessageCircle,
  Facebook,
  ArrowUpRight,
} from "lucide-react";
import { CHANNELS } from "@/const";

const CHANNEL_LIST = [
  {
    name: "Shopee",
    handle: "@wijit.osotthailand",
    desc: "ช้อปสินค้าของแท้ พร้อมโปรโมชั่นและส่วนลดประจำเดือน",
    href: CHANNELS.shopee,
    bg: "#EE4D2D",
    Icon: ShoppingBag,
    cta: "เข้าสู่ร้านค้า",
  },
  {
    name: "TikTok",
    handle: "@cher_antiaging",
    desc: "รับชมรีวิวจริง วิดีโอแนะนำ และซื้อสินค้าผ่าน TikTok Shop",
    href: CHANNELS.tiktok,
    bg: "#000000",
    Icon: Music2,
    cta: "ติดตามและสั่งซื้อ",
  },
  {
    name: "LINE Official",
    handle: "@wijitosot",
    desc: "พูดคุยกับเภสัชกรของเราโดยตรง สอบถามและสั่งซื้อง่ายผ่าน LINE",
    href: CHANNELS.line,
    bg: "#06C755",
    Icon: MessageCircle,
    cta: "เพิ่มเพื่อน",
  },
  {
    name: "Facebook",
    handle: "Wijit.Osot",
    desc: "ติดตามข่าวสาร โปรโมชั่น และเรื่องราวจากแพทย์ผู้เชี่ยวชาญของเรา",
    href: CHANNELS.facebook,
    bg: "#1877F2",
    Icon: Facebook,
    cta: "ไปที่เพจ",
  },
];

export default function ChannelsSection() {
  return (
    <section
      id="channels"
      className="py-20 md:py-28 bg-[var(--sage)]/45 relative grain"
    >
      <div className="container relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="section-num">05 — Order Channels</span>
          <span className="h-px w-16 bg-[var(--wijit)]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12 md:mb-14">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--wijit-deep)] leading-[1.15]">
              สั่งซื้อสินค้าได้ทุกช่องทาง
              <br />
              <span className="text-foreground">เลือกที่สะดวกที่สุดสำหรับคุณ</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-foreground/75 text-base md:text-lg leading-[1.85]">
              เพียงเลือกช่องทางที่คุณใช้ประจำ —
              ทุกแพลตฟอร์มเชื่อมต่อกับร้านวิจิตรโอสถโดยตรง พร้อมการจัดส่งที่รวดเร็ว
              และทีมงานที่พร้อมดูแลทุกคำถาม
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {CHANNEL_LIST.map((c, i) => {
            const Icon = c.Icon;
            return (
              <a
                key={c.name}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-lg p-6 md:p-8 text-white transition-all duration-300 hover:-translate-y-1 reveal"
                style={{ background: c.bg, animationDelay: `${60 * i}ms` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/15 backdrop-blur rounded-md p-2.5">
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-display text-xl md:text-2xl font-bold leading-tight">
                          {c.name}
                        </div>
                        <div className="font-mono text-[11px] tracking-wider opacity-85 mt-0.5">
                          {c.handle}
                        </div>
                      </div>
                    </div>
                    <p className="mt-5 text-sm md:text-[15px] opacity-90 leading-[1.7]">
                      {c.desc}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold opacity-95 group-hover:gap-3 transition-all">
                      {c.cta}
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
                {/* hover halo */}
                <div
                  aria-hidden
                  className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
