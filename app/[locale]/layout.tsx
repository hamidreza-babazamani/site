
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";

import { routing } from "@/i18n/routing";
import Layout from "@/layouts/Layout";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { getPublicSiteBranding } from "@/lib/services/public-portfolio";

import "./globals.css";



const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://kamyarkamali.ir"
).replace(/\/+$/, "");

type SupportedLocale = "fa" | "en";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};


const iranYekan = localFont({
  src: "../fonts/persian/woff2/IRANSansX-Regular.woff2",
  variable: "--font-iran",
  display: "swap",
});

const englishFont = localFont({
  src: "../fonts/en/JetBrainsMono-Regular.ttf",
  variable: "--font-en",
  display: "swap",
});



const seo = {
  fa: {
    title:
      "حمیدرضا بابازمانی | مهندس نرم‌افزار، Next.js و اپلیکیشن‌های هوش مصنوعی",

    description:
      "وب‌سایت رسمی حمیدرضا بابازمانی، توسعه‌دهنده نرم‌افزار متخصص در React، Next.js، TypeScript و Node.js با تمرکز بر توسعه وب‌اپلیکیشن‌های مدرن، اپلیکیشن‌های هوش مصنوعی، عملکرد، امنیت و سئو.",

    keywords: [
      "حمیدرضا بابازمانی",
      "Hamidreza Babazamani",
      "مهندس نرم افزار",
      "توسعه دهنده فرانت اند",
      "توسعه دهنده فول استک",
      "طراحی سایت",
      "طراحی سایت با Next.js",
      "برنامه نویس React",
      "اپلیکیشن هوش مصنوعی",
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "LLM",
    ],
  },

  en: {
    title:
      "Hamidreza Babazamani | Software Engineer · Next.js & AI Applications",

    description:
      "Official portfolio of Hamidreza Babazamani, a software developer specializing in React, Next.js, TypeScript, Node.js, modern web applications, AI integrations, performance, security, and technical SEO.",

    keywords: [
      "Hamidreza Babazamani",
      "Software Engineer",
      "Frontend Developer",
      "Full Stack Developer",
      "React Developer",
      "Next.js Developer",
      "TypeScript",
      "Node.js",
      "AI Applications",
      "LLM Integration",
      "Web Performance",
      "Web Security",
      "Technical SEO",
    ],
  },
} as const;


function getPersonSchema(locale: SupportedLocale) {
  const isFA = locale === "fa";

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,

    name: "Hamidreza Babazamani",
    alternateName: "حمیدرضا بابازمانی",

    url: `${siteUrl}/${locale}`,

    jobTitle: isFA
      ? "توسعه‌دهنده نرم‌افزار و اپلیکیشن‌های هوش مصنوعی"
      : "Software Developer and AI Application Developer",

    description: seo[locale].description,

    knowsAbout: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Frontend Development",
      "Backend Development",
      "Web Performance",
      "Web Security",
      "Technical SEO",
      "AI Applications",
      "Large Language Models",
    ],

    sameAs: [
      "https://github.com/Kamyarkamali",
      "https://www.linkedin.com/in/kamyar-kamali-671a5822b/",
    ],
  };
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const currentLocale = locale as SupportedLocale;
  const isFA = currentLocale === "fa";
  const content = seo[currentLocale];
  const branding = await getPublicSiteBranding();
  const faviconUrl = branding.favicon?.url || "/favicon.ico";

  return {
    metadataBase: new URL(siteUrl),

    applicationName: "Hamidreza Babazamani Portfolio",

    title: {
      default: content.title,
      template: isFA
        ? "%s | حمیدرضا بابازمانی"
        : "%s | Hamidreza Babazamani",
    },

    description: content.description,

    keywords: [...content.keywords],

    authors: [
      {
        name: "Hamidreza Babazamani",
        url: siteUrl,
      },
    ],

    creator: "Hamidreza Babazamani",
    publisher: "Hamidreza Babazamani",

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",

      locale: isFA ? "fa_IR" : "en_US",

      alternateLocale: isFA
        ? ["en_US"]
        : ["fa_IR"],

      siteName: "Hamidreza Babazamani",

      title: content.title,
      description: content.description,

      images: [
        {
          url: "/images/og-cover.jpg",
          width: 1200,
          height: 630,

          alt: isFA
            ? "حمیدرضا بابازمانی - توسعه‌دهنده نرم‌افزار"
            : "Hamidreza Babazamani - Software Developer",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: content.title,
      description: content.description,

      images: ["/images/og-cover.jpg"],
    },

    icons: {
      icon: [{
        url: faviconUrl,
        ...(!branding.favicon ? { type: "image/x-icon" } : {}),
      }],
      ...(branding.favicon
        ? { apple: [{ url: faviconUrl }] }
        : {}),
    },

    category: "technology",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const currentLocale = locale as SupportedLocale;
  const isFA = currentLocale === "fa";

  const personSchema = getPersonSchema(currentLocale);

  const fontClassName = isFA
    ? iranYekan.className
    : englishFont.className;
  const branding = await getPublicSiteBranding();

  return (
    <html
      lang={currentLocale}
      dir={isFA ? "rtl" : "ltr"}
      className={fontClassName}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        <DarkModeProvider>
          <NextIntlClientProvider locale={currentLocale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            >
              <Layout siteLogo={branding.logo}>{children}</Layout>
            </ThemeProvider>
          </NextIntlClientProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
