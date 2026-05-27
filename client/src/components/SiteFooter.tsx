/**
 * SiteFooter — dark deep-forest footer with brand statement + corporate info
 */

import { LOGO_URL, COMPANY, CHANNELS } from "@/const";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--wijit-deep)] text-white pt-16 md:pt-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-white rounded-md p-1.5">
                <img
                  src={LOGO_URL}
                  alt="วิจิตรโอสถ"
                  className="h-10 w-auto"
                />
              </div>
              <div>
                <div className="font-display text-lg font-bold">
                  วิจิตรโอสถ
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/70">
                  Wijitosot Co., Ltd.
                </div>
              </div>
            </div>
            <p className="text-white/75 text-sm leading-[1.85] max-w-md">
              ผู้พัฒนาและจัดจำหน่ายผลิตภัณฑ์อาหารเสริม ยา วิตามิน
              และผลิตภัณฑ์สมุนไพรไทย
              ภายใต้การดูแลของแพทย์ผู้เชี่ยวชาญและเภสัชกร
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--wijit)] mb-4">
              Company
            </div>
            <ul className="space-y-2.5 text-sm text-white/85">
              <li className="leading-[1.7]">{COMPANY.address}</li>
              <li>
                <a
                  href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                  className="hover:text-[var(--wijit)] transition-colors"
                >
                  {COMPANY.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="hover:text-[var(--wijit)] transition-colors"
                >
                  {COMPANY.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--wijit)] mb-4">
              Order Channels
            </div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={CHANNELS.shopee}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/85 hover:text-[var(--wijit)] transition-colors"
                >
                  Shopee · @wijit.osotthailand
                </a>
              </li>
              <li>
                <a
                  href={CHANNELS.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/85 hover:text-[var(--wijit)] transition-colors"
                >
                  TikTok · @cher_antiaging
                </a>
              </li>
              <li>
                <a
                  href={CHANNELS.line}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/85 hover:text-[var(--wijit)] transition-colors"
                >
                  LINE Official · @wijitosot
                </a>
              </li>
              <li>
                <a
                  href={CHANNELS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/85 hover:text-[var(--wijit)] transition-colors"
                >
                  Facebook · Wijit.Osot
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="font-mono text-xs text-white/60">
            © {year} {COMPANY.nameEn}. All rights reserved.
          </div>
          <div className="font-mono text-xs text-white/60">
            พัฒนาสูตรโดยแพทย์และเภสัชกร · ผลิตในประเทศไทย
          </div>
        </div>
      </div>
    </footer>
  );
}
