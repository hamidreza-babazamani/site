// layout.tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Layout from "@/layouts/Layout";
import localFont from "next/font/local";
import "./globals.css";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

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
  params: { locale: string };
}) {
  const locale = params.locale;
  const isFA = locale === "fa";

  return {
    title: isFA
      ? "کامیار کمالی | توسعه‌دهنده فرانت‌اند React, Next.js و Node.js"
      : "Kamyar Kamali | Frontend Developer React, Next.js & Node.js",

    description: isFA
      ? "کامیار کمالی، برنامه‌نویس فرانت‌اند با تخصص React، Next.js و توسعه بک‌اند با Node.js و Express. طراحی و توسعه وب‌سایت‌های مدرن، سریع و حرفه‌ای."
      : "Kamyar Kamali, Frontend Developer specializing in React, Next.js, and backend development with Node.js & Express. Building fast and modern web applications.",

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
          "Frontend Developer",
          "React Developer",
          "Next.js Engineer",
          "Node.js Developer",
          "Express Developer",
          "Web Developer",
        ],

    alternates: {
      canonical: `https://kamyarkamali.ir/${locale}`,
      languages: {
        fa: "https://kamyarkamali.ir/fa",
        en: "https://kamyarkamali.ir/en",
      },
    },

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
          <Script src="https://js.hcaptcha.com/1/api.js" async defer />
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
