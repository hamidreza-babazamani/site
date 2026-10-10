import Photo from "@/components/Photo";
import Sochial from "@/components/Sochial";
import Stats from "@/components/Stats";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { TfiDownload } from "react-icons/tfi";
import SkillsCircle from "@/components/SkillsCircle";


function HomePageTemplate() {
  const locale = useLocale();

  const t = useTranslations("HomePage");
  return (
    <section className="w-full">
      <div className="container mx-auto h-full order-2 xl:order-none px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row items-center justify-between pt-10 xl:pt-16 pb-16 xl:pb-24 gap-8">
          {/* text */}
          <div className="text-center order-2 xl:order-1 xl:text-left dark:text-white text-gray-800 max-w-2xl">
            <h1
              className={`text-[32px] sm:text-[40px] md:text-[48px] xl:text-[64px] leading-tight font-semibold ${
                locale === "fa" ? "text-right" : "text-center xl:text-left"
              }`}
            >
              <span
                className="bg-gradient-to-r from-green-400 via-teal-500 to-emerald-400 bg-clip-text text-transparent animate-gradient-wave
               drop-shadow-md"
              >
                {t("me.me")}&nbsp;
              </span>
              <span
                className="bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400 bg-clip-text text-transparent animate-gradient-wave
               drop-shadow-md"
              >
                {t("me.name")}
              </span>
            </h1>

            <h2
              className={`${
                locale === "fa" ? "text-right" : "text-left"
              } text-[18px] sm:text-[20px] md:text-[24px] font-semibold mt-4
     bg-gradient-to-r from-green-400 via-teal-500 to-emerald-400
     bg-clip-text text-transparent animate-gradient-wave`}
            >
              {t("me.how")}
            </h2>

            <p
              className={`${
                locale === "fa" ? "text-right" : "text-left"
              } mt-4 text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed
     text-gray-700 dark:text-gray-300`}
            >
              {t("me.skill")}
            </p>

            <div className="flex flex-col mt-8 xl:flex-row items-center gap-8">
              <a href="files/kamyar-kamali.pdf" download>
                <Button
                  variant={"default"}
                  size="lg"
                  className="uppercase flex items-center gap-2"
                >
                  <span>{t("me.download")}</span>
                  <TfiDownload className="text-xl" />
                </Button>
              </a>

              {/* sochial */}
              <div className="mb-8 xl:mb-0 flex">
                <Sochial
                  containerStyle="flex gap-6 items-center"
                  iconStyle="w-9 h-9 border-[1px] border-green-600 rounded-[100%] flex  justify-center items-center hover:bg-green-600 text-center text-base hoveer:transition-all p-2 duration-500"
                />
              </div>
            </div>
          </div>

          {/*sochial */}

          <div className="order-1 xl:order-2 mb-8 xl:mb-0">
            <Photo />
          </div>
        </div>
      </div>
      <Stats />
      <SkillsCircle />
    </section>
  );
}

export default HomePageTemplate;
