import type { IconType } from "react-icons";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";
import { Mail, MessageCircle, Phone } from "lucide-react";
import type { PublicContactMethod } from "@/lib/services/public-portfolio";

export const DEFAULT_CONTACT_METHODS: PublicContactMethod[] = [
  {
    _id: "default-whatsapp",
    type: "whatsapp",
    label: { fa: "واتساپ", en: "WhatsApp" },
    value: "09306691916",
    url: "https://wa.me/989306691916",
  },
  {
    _id: "default-telegram",
    type: "telegram",
    label: { fa: "تلگرام", en: "Telegram" },
    value: "09306691916",
    url: "https://t.me/+989306691916",
  },
  {
    _id: "default-linkedin",
    type: "linkedin",
    label: { fa: "لینکدین", en: "LinkedIn" },
    value: "hamidreza-babazamani-49b7aa248",
    url: "https://www.linkedin.com/in/hamidreza-babazamani-49b7aa248",
  },
  {
    _id: "default-github",
    type: "github",
    label: { fa: "گیت‌هاب", en: "GitHub" },
    value: "github.com/hamidreza-babazamani",
    url: "https://github.com/hamidreza-babazamani",
  },
  {
    _id: "default-email",
    type: "email",
    label: { fa: "ایمیل", en: "Email" },
    value: "hamidrezababazamani@gmail.com",
  },
  {
    _id: "default-instagram",
    type: "instagram",
    label: { fa: "اینستاگرام", en: "Instagram" },
    value: "@hamidreza_babazamani",
    url: "https://www.instagram.com/hamidreza_babazamani/",
  },
];

const normalizePhoneForLink = (raw: string) => {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("09") && digits.length === 11) {
    return `98${digits.slice(1)}`;
  }
  return digits.replace(/^\+/, "");
};

export function resolveContactHref(item: {
  type: string;
  value: string;
  url?: string;
}): string | undefined {
  if (item.url) {
    try {
      const parsed = new URL(item.url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
    } catch {
      // Fall through to type-based resolution
    }
  }

  const type = item.type.trim().toLowerCase();
  const value = item.value.trim();

  if (type === "email" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `mailto:${value}`;
  }
  if (type === "phone" && /^[+\d][\d\s().-]{5,}$/.test(value)) {
    return `tel:${value.replace(/\s+/g, "")}`;
  }
  if (type === "whatsapp" && /^[+\d][\d\s().-]{5,}$/.test(value)) {
    return `https://wa.me/${normalizePhoneForLink(value)}`;
  }
  if (type === "telegram") {
    if (/^[+\d][\d\s().-]{5,}$/.test(value)) {
      return `https://t.me/+${normalizePhoneForLink(value)}`;
    }
    const handle = value.replace(/^@/, "");
    if (/^[a-zA-Z0-9_]{3,}$/.test(handle)) {
      return `https://t.me/${handle}`;
    }
  }
  if (type === "instagram") {
    const handle = value.replace(/^@/, "");
    if (/^[a-zA-Z0-9._]{2,}$/.test(handle)) {
      return `https://www.instagram.com/${handle}/`;
    }
  }

  return undefined;
}

export function getContactIcon(type: string): IconType | typeof Mail {
  switch (type.trim().toLowerCase()) {
    case "whatsapp":
      return FaWhatsapp;
    case "telegram":
      return FaTelegramPlane;
    case "linkedin":
      return FaLinkedinIn;
    case "github":
      return FaGithub;
    case "instagram":
      return FaInstagram;
    case "email":
      return Mail;
    case "phone":
      return Phone;
    default:
      return MessageCircle;
  }
}

export function getContactHoverClass(type: string): string {
  switch (type.trim().toLowerCase()) {
    case "whatsapp":
      return "hover:text-[#25D366] dark:hover:text-[#4ADE80]";
    case "telegram":
      return "hover:text-[#229ED9] dark:hover:text-[#55BDEA]";
    case "linkedin":
      return "hover:text-[#0A66C2] dark:hover:text-[#70B5F9]";
    case "github":
      return "hover:text-slate-900 dark:hover:text-white";
    case "instagram":
      return "hover:text-[#E1306C] dark:hover:text-[#F472B6]";
    case "email":
      return "hover:text-emerald-700 dark:hover:text-emerald-300";
    default:
      return "hover:text-emerald-700 dark:hover:text-emerald-300";
  }
}

export function getContactIconBadgeClass(type: string): string {
  switch (type.trim().toLowerCase()) {
    case "whatsapp":
      return "text-[#16A34A] bg-[#25D366]/10 group-hover:bg-[#25D366]/15 dark:text-[#4ADE80]";
    case "telegram":
      return "text-[#0284C7] bg-[#229ED9]/10 group-hover:bg-[#229ED9]/15 dark:text-[#38BDF8]";
    case "linkedin":
      return "text-[#0A66C2] bg-[#0A66C2]/10 group-hover:bg-[#0A66C2]/15 dark:text-[#60A5FA]";
    case "github":
      return "text-slate-800 bg-slate-900/[0.06] group-hover:bg-slate-900/10 dark:text-slate-100 dark:bg-white/10";
    case "instagram":
      return "text-[#E1306C] bg-[#E1306C]/10 group-hover:bg-[#E1306C]/15 dark:text-[#F472B6]";
    case "email":
      return "text-emerald-700 bg-emerald-500/10 group-hover:bg-emerald-500/15 dark:text-emerald-300";
    case "phone":
      return "text-teal-700 bg-teal-500/10 group-hover:bg-teal-500/15 dark:text-teal-300";
    default:
      return "text-slate-600 bg-slate-900/[0.04] group-hover:bg-emerald-500/10 group-hover:text-emerald-700 dark:bg-white/[0.06] dark:text-slate-300 dark:group-hover:text-emerald-300";
  }
}
