import { useTranslations } from "next-intl";

import HomePageTemplate from "@/templates/HomePageTemplate";

export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <>
      <HomePageTemplate />
    </>
  );
}
