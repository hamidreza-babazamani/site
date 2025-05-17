import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomePageTemplate from "@/templates/HomePageTemplate";
import PageTransition from "@/components/PageTransition";
import StairTransition from "@/components/StairTransition";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "HomePage",
  });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function HomePage() {
  return (
    <PageTransition>
      <HomePageTemplate />
      <StairTransition />
    </PageTransition>
  );
}
