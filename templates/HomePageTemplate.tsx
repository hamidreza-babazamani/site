import Photo from "@/components/Photo";
import Sochial from "@/components/Sochial";
import Stats from "@/components/Stats";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { getPublicPortfolio } from "@/lib/services/public-portfolio";
import { TfiDownload } from "react-icons/tfi";
import SkillsCircle from "@/components/SkillsCircle";
import ShootingStars from "@/components/ShootingStars";

async function HomePageTemplate() {
  const locale = await getLocale();
  const t = await getTranslations("HomePage");
  const portfolio = await getPublicPortfolio();

  const isPersian = locale === "fa";

  return (
    <section className="w-full">
      {/* محدوده Hero: افکت ستاره‌ها فقط در این قسمت اجرا می‌شود */}
      <div className="relative isolate overflow-hidden">
        {/* لایه پس‌زمینه ستاره‌ها */}
        <ShootingStars />

        {/* محتوای اصلی Hero بالاتر از لایه ستاره‌ها */}
        <div className="container relative z-10 mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 pt-10 pb-16 xl:pt-16 xl:pb-24">
            {/* بخش متن‌های اصلی Hero */}
            <div
              className={`
                order-2 xl:order-1
                w-full max-w-2xl
                text-center
                ${isPersian ? "text-right" : "xl:text-left"}
              `}
            >
              {/* عنوان اصلی و نام */}
              <h1
                className="
                  text-[36px] sm:text-[46px]
                  md:text-[56px] xl:text-[68px]
                  leading-[1.2]
                  font-extrabold
                  tracking-tight
                  text-slate-900 dark:text-white
                "
              >
                <span className="text-slate-500 dark:text-slate-400">
                  {t("me.me")}{" "}
                </span>

                <span className="group/name relative isolate inline-block">
                  {/* Soft ambient glow */}
                  <span
                    aria-hidden="true"
                    className="
      pointer-events-none absolute
      -inset-x-2 inset-y-0 -z-10
      rounded-2xl
      bg-gradient-to-r
      from-emerald-400/15
      via-teal-400/10
      to-cyan-400/15
      blur-xl
      opacity-60
      transition-opacity duration-500
      group-hover/name:opacity-100
      dark:from-emerald-400/20
      dark:via-teal-400/15
      dark:to-cyan-400/20
    "
                  />

                  {/* Premium gradient typography */}
                  <span
                    className="
      relative inline-block
      bg-gradient-to-r
      from-emerald-700
      via-teal-500
      to-cyan-600
      dark:from-emerald-300
      dark:via-teal-300
      dark:to-cyan-400
      bg-clip-text text-transparent
      [background-size:200%_auto]
      motion-safe:animate-gradient-wave
      transition-[filter,transform] duration-500
      group-hover/name:brightness-110
    "
                  >
                    {portfolio.profile?.name?.[locale as "fa" | "en"] ||
                      t("me.name")}
                  </span>
                </span>
              </h1>

              {/* عنوان شغلی */}
              <h2
                className={`
                  mt-6
                  text-[19px] sm:text-[23px]
                  md:text-[27px]
                  font-semibold
                  leading-relaxed
                  text-slate-800
                  dark:text-slate-100
                  ${isPersian ? "text-right" : "text-left"}
                `}
              >
                <span
                  className="
                    inline-block
                    border-b-2
                    border-emerald-500/70
                    pb-2
                  "
                >
                  {portfolio.hero?.headline?.[locale as "fa" | "en"] ||
                    portfolio.hero?.jobTitle?.[locale as "fa" | "en"] ||
                    t("me.how")}
                </span>
              </h2>

              {/* توضیحات مهارت‌ها */}

              <div
                className={`
    group relative mt-7 max-w-2xl
    ${isPersian ? "text-right" : "text-left"}
  `}
                dir={isPersian ? "rtl" : "ltr"}
              >
                {/* Decorative gradient line */}
                <span
                  aria-hidden="true"
                  className={`
      absolute inset-y-1 w-[3px] rounded-full
      bg-gradient-to-b
      from-cyan-500 via-blue-500 to-violet-500
      opacity-80
      ${isPersian ? "right-0" : "left-0"}
    `}
                />

                <p
                  className="
    relative
    px-5 sm:px-6
    text-[15px] sm:text-[18px] md:text-[19px]
    leading-[2] md:leading-[2.1]
    font-normal
    tracking-normal
    text-justify
    [text-align-last:start]
    [text-justify:inter-word]
    [overflow-wrap:break-word]
    text-slate-600 dark:text-slate-300
    transition-colors duration-300
    group-hover:text-slate-800
    dark:group-hover:text-slate-100
    motion-safe:animate-[fadeInUp_700ms_ease-out_both]
  "
                >
                  {portfolio.hero?.description?.[locale as "fa" | "en"] ||
                    portfolio.profile?.bio?.[locale as "fa" | "en"] ||
                    t("me.skill")}
                </p>
              </div>

              {/* دکمه دانلود و شبکه‌های اجتماعی */}
              {(portfolio.resumeAvailable || portfolio.hero?.primaryCtaUrl) && (
                <div
                  className="
                  flex flex-col
                  xl:flex-row
                  items-center
                  gap-8
                  mt-8
                "
                >
                  <a
                    href={
                      portfolio.resumeAvailable
                        ? "/api/public/resume/download"
                        : portfolio.hero?.primaryCtaUrl
                    }
                    target={portfolio.resumeAvailable ? undefined : "_blank"}
                    rel={
                      portfolio.resumeAvailable
                        ? undefined
                        : "noopener noreferrer"
                    }
                    download={portfolio.resumeAvailable ? true : undefined}
                  >
                    <Button
                      variant="default"
                      size="lg"
                      className="uppercase flex items-center gap-2"
                    >
                      <span>
                        {portfolio.hero?.primaryCta?.[locale as "fa" | "en"] ||
                          t("me.download")}
                      </span>
                      <TfiDownload className="text-xl" />
                    </Button>
                  </a>

                  <div className="mb-8 xl:mb-0 flex">
                    <Sochial
                      containerStyle="flex gap-6 items-center"
                      iconStyle="w-9 h-9 border-[1px] border-green-600 rounded-full flex justify-center items-center hover:bg-green-600 text-center text-base p-2 transition-all duration-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* تصویر پروفایل - بدون تغییر */}
            <div className="order-1 xl:order-2 mb-8 xl:mb-0">
              <Photo hero={portfolio.hero} fallbackImage={portfolio.fallbackImage} />
            </div>
          </div>
        </div>
      </div>

      {/* بخش‌های دیگر خارج از محدوده افکت */}
      <Stats />
      <SkillsCircle skills={portfolio.technologies} locale={locale} />
    </section>
  );
}

export default HomePageTemplate;
