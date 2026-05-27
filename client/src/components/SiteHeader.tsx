/**
 * SiteHeader — Modern Clinical Apothecary navigation
 * Reflects design philosophy: clinical authority + editorial composition.
 * Uses serif Thai display for brand name; sans for nav.
 */

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LOGO_URL, COMPANY, CHANNELS } from "@/const";

const NAV = [
  { id: "about", label: "เกี่ยวกับเรา" },
  { id: "standards", label: "มาตรฐาน" },
  { id: "products", label: "ผลิตภัณฑ์" },
  { id: "channels", label: "ช่องทางสั่งซื้อ" },
  { id: "contact", label: "ติดต่อ" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 md:gap-3 group"
          >
            <img
              src={LOGO_URL}
              alt="วิจิตรโอสถ Wijitosot"
              className="h-10 md:h-12 w-auto"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-base md:text-lg font-bold text-[var(--wijit-deep)]">
                วิจิตรโอสถ
              </span>
              <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--wijit-dark)] uppercase">
                Wijitosot Co., Ltd.
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="text-sm font-medium text-foreground/75 hover:text-[var(--wijit-deep)] transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:bg-[var(--wijit)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left after:duration-300"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className="font-mono text-xs tracking-wider text-foreground/70 hover:text-[var(--wijit-deep)]"
            >
              {COMPANY.phoneDisplay}
            </a>
            <a
              href={CHANNELS.shopee}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex items-center px-4 py-2 rounded-full bg-[var(--wijit-deep)] text-white text-sm font-semibold hover:bg-[var(--wijit-dark)] transition-colors"
            >
              สั่งซื้อสินค้า
            </a>
          </div>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-border pt-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="text-left px-2 py-2.5 text-sm font-medium hover:bg-[var(--sage)] rounded-md"
              >
                {n.label}
              </button>
            ))}
            <a
              href={CHANNELS.shopee}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[var(--wijit-deep)] text-white text-sm font-semibold"
            >
              สั่งซื้อสินค้า
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
