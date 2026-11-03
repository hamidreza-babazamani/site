import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  ArrowUpRight,
  Code2,
  Layers3,
  MonitorSmartphone,
  Palette,
  Sparkles,
} from "lucide-react";
import { getPublicPortfolio } from "@/lib/services/public-portfolio";

const iconMap = {
  Code2,
  MonitorSmartphone,
  Layers3,
  Palette,
  Sparkles,
} as const;
const localize = (
  value: { fa?: string; en?: string } | undefined,
  locale: string,
) =>
  (locale === "fa" ? value?.fa : value?.en)?.trim() ||
  value?.en?.trim() ||
  value?.fa?.trim() ||
  "";

export default async function ServicesComponent() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const portfolio = await getPublicPortfolio();

  return (
    <section
      id="services"
      className="
        relative isolate
        overflow-hidden
        px-4 py-16
        sm:px-6 sm:py-20
        lg:py-24
      "
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 -z-10
          overflow-hidden
        "
      >
        <div
          className="
            absolute -top-40 -start-40
            size-[450px]
            rounded-full
            bg-emerald-300/15
            blur-[100px]
            dark:bg-emerald-500/[0.07]
          "
        />

        <div
          className="
            absolute -bottom-40 -end-40
            size-[450px]
            rounded-full
            bg-cyan-300/15
            blur-[100px]
            dark:bg-cyan-500/[0.07]
          "
        />
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-14">
          <div
            className="
              inline-flex w-fit
              items-center gap-2
              rounded-full
              border border-emerald-500/15
              bg-emerald-500/[0.06]
              px-4 py-2
              text-xs font-semibold
              tracking-wide
              text-emerald-700
              dark:border-emerald-400/15
              dark:bg-emerald-400/[0.06]
              dark:text-emerald-300
            "
          >
            <Sparkles size={14} aria-hidden="true" />
            {t("links.services")}
          </div>

          <div
            className="
              h-px w-full
              bg-gradient-to-r
              from-emerald-500/30
              via-emerald-500/10
              to-transparent
            "
          />
        </div>

        {/* Service cards */}
        <div
          className="
            grid grid-cols-1
            gap-4
            md:grid-cols-2
            lg:gap-5
          "
        >
          {portfolio.services.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-emerald-500/20 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {locale === "fa"
                ? "خدمتی برای نمایش ثبت نشده است."
                : "No services are available yet."}
            </p>
          ) : (
            portfolio.services.map((service, index) => {
              const Icon =
                iconMap[service.icon as keyof typeof iconMap] ?? Code2;
              const title = localize(service.title, locale);
              const description = localize(service.description, locale);

              return (
                <article
                  key={service._id}
                  className={`
                  group relative
                  flex h-full flex-col
                  overflow-hidden
                  rounded-[26px]
                  border border-emerald-900/[0.08]
                  bg-white/65
                  p-6
                  shadow-[0_8px_35px_rgba(15,23,42,0.035)]
                  backdrop-blur-xl

                  transition-[border-color,background-color,box-shadow,transform]
                  duration-300 ease-out

                  hover:-translate-y-1
                  hover:border-emerald-500/25
                  hover:bg-white/90
                  hover:shadow-[0_18px_45px_rgba(16,185,129,0.09)]

                  dark:border-white/[0.08]
                  dark:bg-white/[0.035]
                  dark:shadow-none
                  dark:hover:border-emerald-400/25
                  dark:hover:bg-white/[0.055]
                  dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]

                  motion-reduce:transform-none
                  motion-reduce:transition-none

                  sm:p-8
                  lg:p-9

                  ${
                    index === portfolio.services.length - 1 &&
                    portfolio.services.length % 2 === 1
                      ? "md:col-span-2"
                      : ""
                  }
                `}
                >
                  {/* Corner glow */}
                  <div
                    aria-hidden="true"
                    className="
                    pointer-events-none
                    absolute -top-24 -end-24
                    size-56 rounded-full
                    bg-emerald-300/0
                    blur-3xl
                    transition-colors duration-500
                    group-hover:bg-emerald-300/20
                    dark:group-hover:bg-emerald-400/[0.09]
                  "
                  />

                  {/* Top row */}
                  <div
                    className="
                    relative mb-8
                    flex items-start justify-between
                    gap-4
                  "
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="
                        flex size-13
                        shrink-0 items-center justify-center
                        rounded-2xl
                        border border-emerald-500/15
                        bg-emerald-500/[0.07]
                        text-emerald-700
                        transition-[background-color,border-color]
                        duration-300
                        group-hover:border-emerald-500/25
                        group-hover:bg-emerald-500/10
                        dark:border-emerald-400/15
                        dark:bg-emerald-400/[0.07]
                        dark:text-emerald-300
                      "
                      >
                        {service.image?.url?.trim() ? (
                          <img
                            src={service.image.url.trim()}
                            alt={
                              localize(service.image.alt, locale) || title
                            }
                            className="size-9 object-contain"
                          />
                        ) : (
                          <Icon
                            size={23}
                            strokeWidth={1.7}
                            aria-hidden="true"
                          />
                        )}
                      </span>

                      <span
                        className="
                        text-sm font-semibold
                        tracking-[0.15em]
                        text-slate-400
                        dark:text-slate-500
                      "
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <Link
                      href="/services"
                      aria-label={title}
                      className="
                      relative flex size-11
                      shrink-0 items-center justify-center
                      rounded-full
                      border border-slate-200/80
                      bg-white/70
                      text-slate-500
                      transition-[background-color,border-color,color,transform]
                      duration-300

                      hover:-translate-y-0.5
                      hover:translate-x-0.5
                      hover:border-emerald-500/30
                      hover:bg-emerald-500
                      hover:text-white

                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-emerald-500

                      dark:border-white/10
                      dark:bg-white/[0.05]
                      dark:text-slate-300
                      dark:hover:border-emerald-400/30
                      dark:hover:bg-emerald-400
                      dark:hover:text-[#061512]

                      motion-reduce:transform-none
                    "
                    >
                      <ArrowUpRight
                        size={19}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="relative flex flex-1 flex-col">
                    <h2
                      className="
                      mb-4
                      text-xl font-bold
                      leading-snug
                      tracking-tight
                      text-slate-900
                      transition-colors duration-300
                      group-hover:text-emerald-800
                      dark:text-slate-100
                      dark:group-hover:text-emerald-300
                      sm:text-2xl
                      lg:text-[27px]
                    "
                    >
                      {title}
                    </h2>

                    <p
                      className="
                      max-w-[60ch]
                      text-sm leading-7
                      text-slate-600
                      dark:text-slate-400
                      sm:text-[15px]
                    "
                    >
                      {description}
                    </p>

                    {/* Bottom accent */}
                    <div
                      className="
                      mt-8 h-px w-full
                      bg-gradient-to-r
                      from-emerald-500/25
                      via-slate-200/60
                      to-transparent
                      dark:from-emerald-400/20
                      dark:via-white/10
                    "
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>
        {/* <div className="mt-20">
          <WorkePage initialProjects={portfolio.projects} embedded />
        </div> */}
      </div>
    </section>
  );
}
