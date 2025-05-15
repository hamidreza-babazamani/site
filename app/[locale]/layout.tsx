// layout.tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Layout from "@/layouts/Layout";
import localFont from "next/font/local";
import "./globals.css";
import { DarkModeProvider } from "@/context/DarkModeContext";

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

// ✅ generateMetadata برای SEO
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;

  return {
    title:
      locale === "fa"
        ? "کامیار کمالی | توسعه‌دهنده فرانت‌اند و متخصص وردپرس"
        : "Kamyar Kamali | Frontend Developer & WordPress Expert",
    description:
      locale === "fa"
        ? "کامیار کمالی، متخصص فرانت‌اند و وردپرس. طراحی سایت شخصی، شرکتی، فروشگاهی و ریسپانسیو."
        : "Kamyar Kamali, Frontend and WordPress specialist. Creating personal, corporate, and e-commerce websites.",
    alternates: {
      canonical: `https://yourdomain.com/${locale}`,
    },
    other: {
      // ✅ Structured data
      "ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: locale === "fa" ? "کامیار کمالی" : "Kamyar Kamali",
        jobTitle:
          locale === "fa"
            ? "توسعه‌دهنده فرانت‌اند و وردپرس"
            : "Frontend Developer and WordPress Specialist",
        url: `https://yourdomain.com/${locale}`,
        sameAs: [
          "https://github.com/Kamyarkamali",
          "https://www.linkedin.com/in/kamyar-kamali-671a5822b/",
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
          <NextIntlClientProvider>
            <Layout>{children}</Layout>
          </NextIntlClientProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
