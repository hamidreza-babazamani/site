// layout.tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Layout from "@/layouts/Layout";
import localFont from "next/font/local";
import "./globals.css";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { ThemeProvider } from "next-themes";

const iranYekan = localFont({
  src: "../fonts/persian/woff2/IRANSansX-Regular.woff2",
  variable: "--font-iran",
  display: "swap",
});

const googleFont = localFont({
  src: "../fonts/en/JetBrainsMono-Regular.ttf",
  variable: "--font-en",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFA = locale === "fa";

  return {
    title: isFA
      ? "کامیار کمالی | مهندس نرم‌افزار و متخصص اپلیکیشن‌های هوش مصنوعی"
      : "Kamyar Kamali | Software Engineer for AI Applications",

    description: isFA
      ? "کامیار کمالی، مهندس نرم‌افزار با تمرکز بر فرانت‌اند، اپلیکیشن‌های هوش مصنوعی و محصولات مبتنی بر LLM با React، Next.js و TypeScript."
      : "Kamyar Kamali is a software engineer focused on frontend engineering, AI-powered web applications, and LLM-enabled products with React, Next.js, and TypeScript.",

    keywords: isFA
      ? [
          "کامیار کمالی",
          "برنامه نویس",
          "برنامه نویس فرانت اند",
          "توسعه دهنده وب",
          "React",
          "Next.js",
          "Node.js",
          "Express",
          "طراحی سایت",
          "طراح سایت حرفه ای",
        ]
      : [
          "Kamyar Kamali",
          "Software Engineer",
          "AI Applications",
          "Frontend Engineering",
          "React",
          "Next.js",
          "TypeScript",
          "LLM applications",
        ],

    alternates: {
      canonical: `https://kamyarkamali.ir/${locale}`,
      languages: {
        fa: "https://kamyarkamali.ir/fa",
        en: "https://kamyarkamali.ir/en",
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      type: "profile",
      title: isFA ? "کامیار کمالی | مهندس نرم‌افزار و اپلیکیشن‌های هوش مصنوعی" : "Kamyar Kamali | Software Engineer for AI Applications",
      description: isFA ? "فرانت‌اند، اپلیکیشن‌های هوش مصنوعی و محصولات مبتنی بر LLM." : "Frontend engineering, AI-powered web applications, and LLM-enabled products.",
      url: `https://kamyarkamali.ir/${locale}`,
      siteName: "Kamyar Kamali",
      images: [{ url: "https://kamyarkamali.ir/images/kamyar.jpg", width: 1200, height: 630, alt: isFA ? "تصویر کامیار کمالی" : "Kamyar Kamali" }],
    },
    twitter: { card: "summary_large_image", title: isFA ? "کامیار کمالی | مهندس نرم‌افزار" : "Kamyar Kamali | Software Engineer", description: isFA ? "اپلیکیشن‌های هوش مصنوعی و مهندسی فرانت‌اند." : "AI applications and frontend engineering." },

    icons: {
      icon: "/logo.jpg",
      shortcut: "/logo.jpg",
      apple: "/logo.jpg",
    },

    other: {
      "ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: isFA ? "کامیار کمالی" : "Kamyar Kamali",
        jobTitle: isFA
          ? "توسعه‌دهنده فرانت‌اند و Node.js"
          : "Frontend & Node.js Developer",
        url: `https://kamyarkamali.ir/${locale}`,
        sameAs: [
          "https://github.com/Kamyarkamali",
          "https://www.linkedin.com/in/kamyar-kamali-671a5822b/",
        ],
        knowsAbout: isFA
          ? [
              "React",
              "Next.js",
              "Node.js",
              "Express",
              "جاوااسکریپت",
              "طراحی وب",
              "فرانت اند",
              "بک اند",
            ]
          : [
              "React",
              "Next.js",
              "Node.js",
              "Express",
              "JavaScript",
              "Frontend",
              "Backend",
            ],
      }),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={locale === "fa" ? iranYekan.className : googleFont.className}
    >
      <body>
        <DarkModeProvider>
          <NextIntlClientProvider locale={locale}>
            <ThemeProvider attribute="class">
              <Layout>{children}</Layout>
            </ThemeProvider>
          </NextIntlClientProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
