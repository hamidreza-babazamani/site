import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomePageTemplate from "@/templates/HomePageTemplate";
import PageTransition from "@/components/PageTransition";
import { getPublicSiteBranding } from "@/lib/services/public-portfolio";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale === "fa" ? "fa" : "en";
  const [t, branding] = await Promise.all([
    getTranslations({
      locale: currentLocale,
      namespace: "HomePage",
    }),
    getPublicSiteBranding(),
  ]);

  const title = branding.title?.[currentLocale] || t("meta.title");
  const description =
    branding.description?.[currentLocale] || t("meta.description");

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function HomePage() {
  return (
    <PageTransition>
      <HomePageTemplate />
      {/* <StairTransition /> */}
    </PageTransition>
  );
}
