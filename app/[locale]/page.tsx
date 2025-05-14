import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";
import HomePageTemplate from "@/templates/HomePageTemplate";

export default function HomePage() {
  // const t = useTranslations("HomePage");
  return (
    <>
      <HomePageTemplate />
      {/* <h1>{t("title")}</h1>
      <p>{t("wellcome")}</p> */}
    </>
  );
}
