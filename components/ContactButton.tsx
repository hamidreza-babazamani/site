
"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import {
  ArrowUpRight,
  MessageCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import { publicApiClient } from "@/lib/api/axios";
import type { ApiListEnvelope } from "@/lib/api/types";

type PublicContactMethod = { _id?: string; type: string; label?: { fa?: string; en?: string }; value: string; url?: string };
const safeHref = (item: PublicContactMethod): string | null => {
  if (item.url) {
    try { const url = new URL(item.url); return ["http:", "https:"].includes(url.protocol) ? url.href : null; } catch { return null; }
  }
  if (item.type === "email" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.value)) return `mailto:${item.value}`;
  if (item.type === "phone" && /^[+\d][\d\s()-]{5,}$/.test(item.value)) return `tel:${item.value.replace(/\s/g, "")}`;
  return null;
};

export default function ContactButton() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = "floating-contact-menu";

  const isPersian = locale === "fa";
  const [methods, setMethods] = useState<PublicContactMethod[]>([]);

  useEffect(() => {
    void publicApiClient.get<ApiListEnvelope<PublicContactMethod>>("/api/public/contact-methods", { params: { visible: true, limit: 20 } })
      .then(({ data }) => setMethods(Array.isArray(data.data) ? data.data : []))
      .catch(() => setMethods([]));
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const contactLinks = methods.map((item) => ({
    name: item.label?.[locale as "fa" | "en"] || item.label?.en || item.value,
    detail: item.value,
    href: safeHref(item),
    icon: item.type === "phone" ? Phone : item.type === "email" ? Send : MessageCircle,
    external: Boolean(item.url),
  })).filter((item): item is typeof item & { href: string } => Boolean(item.href));
  /* const contactLinks = [
    {
      name: t("call.call"),
      detail: isPersian ? "تماس تلفنی" : "Phone call",
      href: "tel:+989354378110",
      icon: Phone,
      external: false,
    },
    {
      name: t("call.tel"),
      detail: "Telegram",
      href: "https://t.me/KamdevJs",
      icon: Send,
      external: true,
    },
    {
      name: t("call.wats"),
      detail: "WhatsApp",
      href: "https://wa.me/989354378110",
      icon: MessageCircle,
      external: true,
    },
  ]; */

  return (
    <div
      ref={containerRef}
      dir={isPersian ? "rtl" : "ltr"}
      className="
        fixed bottom-5 end-5
        z-50
        flex flex-col items-end
        sm:bottom-7 sm:end-7
      "
    >
      {/* Contact panel */}
      <div
        id={menuId}
        aria-hidden={!open}
        inert={!open}
        className={`
          absolute bottom-[calc(100%+14px)]
          end-0
          w-[min(320px,calc(100vw-40px))]
          origin-bottom-right
          overflow-hidden
          rounded-[24px]
          border border-emerald-900/10
          bg-white/95
          shadow-[0_18px_60px_rgba(15,23,42,0.16)]
          backdrop-blur-2xl
          transition-[opacity,transform,visibility]
          duration-300
          ease-out
          dark:border-white/10
          dark:bg-[#141c26]/95
          dark:shadow-[0_22px_70px_rgba(0,0,0,0.45)]
          motion-reduce:transition-none
          ${
            open
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible translate-y-3 scale-95 opacity-0"
          }
        `}
      >
        {/* Header */}
        <div
          className="
            relative overflow-hidden
            border-b border-emerald-900/10
            px-5 py-4
            dark:border-white/10
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -top-16 -end-10
              size-40 rounded-full
              bg-emerald-400/15
              blur-3xl
              dark:bg-emerald-400/10
            "
          />

          <div className="relative flex items-center gap-3">
            <span
              className="
                flex size-11 shrink-0
                items-center justify-center
                rounded-2xl
                border border-emerald-500/20
                bg-emerald-500/10
                text-emerald-700
                dark:text-emerald-300
              "
            >
              <MessageCircle size={21} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p
                className="
                  text-sm font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {isPersian ? "ارتباط با من" : "Get in touch"}
              </p>

              <p
                className="
                  mt-0.5 text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {isPersian
                  ? "راه ارتباطی دلخواهت رو انتخاب کن"
                  : "Choose how you'd like to connect"}
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-1.5 p-2.5">
          {contactLinks.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={
                  item.external
                    ? "noopener noreferrer"
                    : undefined
                }
                onClick={() => setOpen(false)}
                className="
                  group flex min-h-15
                  items-center gap-3
                  rounded-2xl
                  border border-transparent
                  px-3 py-2.5
                  transition-[background-color,border-color,color]
                  duration-200
                  hover:border-emerald-500/10
                  hover:bg-emerald-500/[0.07]
                  focus-visible:outline-2
                  focus-visible:outline-emerald-500
                  dark:hover:border-white/10
                  dark:hover:bg-white/[0.05]
                "
              >
                <span
                  className="
                    flex size-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-slate-900/[0.04]
                    text-slate-600
                    transition-colors
                    group-hover:bg-emerald-500/10
                    group-hover:text-emerald-700
                    dark:bg-white/[0.06]
                    dark:text-slate-300
                    dark:group-hover:text-emerald-300
                  "
                >
                  <Icon size={19} aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className="
                      block text-sm font-semibold
                      text-slate-800
                      dark:text-slate-100
                    "
                  >
                    {item.name}
                  </span>

                  <span
                    className="
                      mt-0.5 block text-xs
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {item.detail}
                  </span>
                </span>

                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="
                    shrink-0
                    text-slate-300
                    transition-colors
                    group-hover:text-emerald-600
                    dark:text-slate-600
                    dark:group-hover:text-emerald-400
                  "
                />
              </a>
            );
          })}
        </div>
      </div>

      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          open
            ? isPersian
              ? "بستن راه‌های ارتباطی"
              : "Close contact options"
            : isPersian
              ? "نمایش راه‌های ارتباطی"
              : "Open contact options"
        }
        aria-expanded={open}
        aria-controls={menuId}
        className="
          group relative
          flex size-14
          shrink-0 items-center justify-center
          rounded-2xl
          border border-emerald-400/25
          bg-gradient-to-br
          from-emerald-600
          via-teal-600
          to-cyan-700
          text-white
          shadow-[0_8px_28px_rgba(5,150,105,0.28)]
          transition-[transform,box-shadow,background-color]
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_12px_36px_rgba(5,150,105,0.38)]
          active:scale-95
          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-emerald-500
          dark:from-emerald-500
          dark:via-teal-500
          dark:to-cyan-600
          dark:text-[#061512]
          dark:shadow-[0_8px_30px_rgba(16,185,129,0.20)]
          motion-reduce:transform-none
          motion-reduce:transition-none
        "
      >
        {/* Soft halo */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -inset-1.5
            -z-10 rounded-[22px]
            bg-emerald-400/15
            blur-md
          "
        />

        <MessageCircle
          size={24}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`
            absolute transition-[opacity,transform]
            duration-200
            motion-reduce:transition-none
            ${
              open
                ? "scale-75 rotate-90 opacity-0"
                : "scale-100 rotate-0 opacity-100"
            }
          `}
        />

        <X
          size={24}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`
            absolute transition-[opacity,transform]
            duration-200
            motion-reduce:transition-none
            ${
              open
                ? "scale-100 rotate-0 opacity-100"
                : "scale-75 -rotate-90 opacity-0"
            }
          `}
        />

        {/* Decorative dot */}
        {!open && (
          <span
            aria-hidden="true"
            className="
              absolute -top-1 -end-1
              size-3 rounded-full
              border-2 border-[#f8fafc]
              bg-emerald-400
              dark:border-[#0c1118]
            "
          />
        )}
      </button>
    </div>
  );
}
