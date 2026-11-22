
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import localFont from "next/font/local";

import { routing } from "@/i18n/routing";
import Layout from "@/layouts/Layout";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { getPublicSiteBranding } from "@/lib/services/public-portfolio";

import "./globals.css";

export const dynamic = "force-dynamic";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://hamidrezababazamani.ir"
).replace(/\/+$/, "");

type SupportedLocale = "fa" | "en";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};


const iranYekan = localFont({
  src: [
    {
      path: "../fonts/persian/woff2/IRANSansX-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/persian/woff2/IRANSansX-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-iran",
  display: "swap",
});

const englishFont = localFont({
  src: "../fonts/en/JetBrainsMono-VariableFont_wght.ttf",
  variable: "--font-en",
  display: "swap",
});



const seo = {
  fa: {
    title:
      "حمیدرضا بابازمانی | توسعه‌دهنده بک‌اند و فول‌استک (Node.js & Next.js)",

    description:
      "وب‌سایت رسمی حمیدرضا بابازمانی، توسعه‌دهنده بک‌اند و فول‌استک متخصص در Node.js، Express.js، TypeScript، MongoDB، PostgreSQL و Next.js با تمرکز بر طراحی APIهای امن، سیستم‌های بلادرنگ و اپلیکیشن‌های مدرن.",

    keywords: [
      "حمیدرضا بابازمانی",
      "Hamidreza Babazamani",
      "توسعه دهنده بک اند",
      "برنامه نویس بک اند",
      "برنامه نویس Node.js",
      "توسعه دهنده فول استک",
      "طراحی API",
      "مهندس نرم افزار",
      "Node.js",
      "Express.js",
      "TypeScript",
      "MongoDB",
      "PostgreSQL",
      "Next.js",
      "Docker",
      "Socket.IO",
    ],
  },

  en: {
    title:
      "Hamidreza Babazamani | Backend & Full-Stack Developer · Node.js & Next.js",

    description:
      "Official portfolio of Hamidreza Babazamani, a Backend & Full-Stack Developer specializing in Node.js, Express.js, TypeScript, MongoDB, PostgreSQL, Docker, real-time systems, and Next.js.",

    keywords: [
      "Hamidreza Babazamani",
      "Backend Developer",
      "Node.js Developer",
      "Full Stack Developer",
      "Software Engineer",
      "Express.js",
      "TypeScript",
      "MongoDB",
      "PostgreSQL",
      "REST API",
      "Next.js",
      "Docker",
      "Socket.IO",
      "Web Security",
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
      ? "توسعه‌دهنده بک‌اند و فول‌استک (Node.js & Next.js)"
      : "Backend & Full-Stack Developer (Node.js & Next.js)",

    description: seo[locale].description,

    knowsAbout: [
      "Node.js",
      "Express.js",
      "TypeScript",
      "JavaScript",
      "MongoDB",
      "PostgreSQL",
      "Prisma",
      "Mongoose",
      "REST API",
      "JWT Authentication",
      "Socket.IO",
      "Docker",
      "Next.js",
      "React",
      "Backend Development",
      "Full-Stack Development",
      "API Security",
    ],

    sameAs: [
      "https://github.com/hamidreza-babazamani",
      "https://www.linkedin.com/in/hamidreza-babazamani-49b7aa248",
      "https://www.instagram.com/hamidreza_babazamani/",
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
  const resolvedTitle = branding.title?.[currentLocale] || content.title;
  const resolvedDescription =
    branding.description?.[currentLocale] || content.description;
  const resolvedSiteName =
    branding.siteName?.[currentLocale] || "Hamidreza Babazamani";
  const resolvedKeywords =
    branding.keywords?.[currentLocale]?.length
      ? branding.keywords[currentLocale]
      : [...content.keywords];
  const robotsIndex = branding.robots?.index ?? true;
  const robotsFollow = branding.robots?.follow ?? true;
  const ogImageUrl =
    branding.openGraphImage?.url || branding.logo?.url || "/images/logo.png";

  return {
    metadataBase: new URL(siteUrl),

    applicationName: `${resolvedSiteName} Portfolio`,

    title: {
      default: resolvedTitle,
      template: isFA
        ? `%s | ${resolvedSiteName === "Hamidreza Babazamani" ? "حمیدرضا بابازمانی" : resolvedSiteName}`
        : `%s | ${resolvedSiteName}`,
    },

    description: resolvedDescription,

    keywords: resolvedKeywords,

    authors: [
      {
        name: "Hamidreza Babazamani",
        url: siteUrl,
      },
    ],

    creator: "Hamidreza Babazamani",
    publisher: "Hamidreza Babazamani",

    robots: {
      index: robotsIndex,
      follow: robotsFollow,

      googleBot: {
        index: robotsIndex,
        follow: robotsFollow,
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

      siteName: resolvedSiteName,

      title: resolvedTitle,
      description: resolvedDescription,

      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,

          alt:
            branding.openGraphImage?.alt?.[currentLocale] ||
            (isFA
              ? "حمیدرضا بابازمانی - توسعه‌دهنده نرم‌افزار"
              : "Hamidreza Babazamani - Software Developer"),
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: resolvedTitle,
      description: resolvedDescription,

      images: [ogImageUrl],
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
      className={`${fontClassName} ${iranYekan.variable} ${englishFont.variable}`}
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
            <Layout siteLogo={branding.logo}>{children}</Layout>
          </NextIntlClientProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
