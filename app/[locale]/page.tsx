import { getTranslations } from "next-intl/server";
import HomePageTemplate from "@/templates/HomePageTemplate";
import PageTransition from "@/components/PageTransition";
import StairTransition from "@/components/StairTransition";

type Props = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({ params }: Props) {
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
