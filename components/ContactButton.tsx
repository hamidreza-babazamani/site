"use client";
import { useEffect, useRef, useState } from "react";
import { Phone, MessageCircle, Send } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";
import { set } from "react-hook-form";

export default function ContactButton() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("HomePage");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", clickOut);
    return () => {
      document.removeEventListener("click", clickOut);
    };
  }, [open]);

  // مقادیر استایل منو با توجه به زبان
  const menuPositionStyle =
    locale === "fa"
      ? {
          left: "-180px",
          right: "auto",
          origin: "bottom-right",
          transformOrigin: "bottom right",
        }
      : {
          right: "-0px",
          left: "auto",
          origin: "bottom-left",
          transformOrigin: "bottom left",
        };

  return (
    <div
      className={`fixed bottom-6 z-50 flex flex-col items-end ${
        locale === "fa" ? "right-[-8rem]" : "right-6"
      }`}
    >
      {/* منوی بازشونده */}
      <div
        ref={ref}
        className={`flex flex-col gap-3 transition-all duration-300 transform ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{
          marginBottom: "0.75rem",
          width: "220px",
          backgroundColor: "var(--color-bg, white)",
          borderRadius: "0.5rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          padding: "0.75rem",
          position: "relative",
          bottom: "10px",
          zIndex: 60,
          ...menuPositionStyle,
          transformOrigin: menuPositionStyle.transformOrigin,
        }}
      >
        <a
          href="tel:+989354378110"
          className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          <Phone className="w-5 h-5" />
          {t("call.call")}
        </a>

        <a
          href="https://t.me/KamdevJs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-all"
        >
          <Send className="w-5 h-5" />
          {t("call.tel")}
        </a>

        <a
          href="https://wa.me/989354378110"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          {t("call.wats")}
        </a>
      </div>

      {/* دکمه اصلی */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="تماس"
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl transition-all duration-300"
      >
        <Phone className="w-6 h-6" />
      </button>
    </div>
  );
}
