
"use client";

import { useTranslations } from "next-intl";
import CountUp from "react-countup";

function Stats() {
  const t = useTranslations("HomePage");

  const stats = [
    {
      num: 4,
      text: t("stats.text1"),
    },
    {
      num: 48,
      text: t("stats.text2"),
    },
    {
      num: 8,
      text: t("stats.text3"),
    },
    {
      num: 500,
      text: t("stats.text4"),
    },
  ];

  return (
    <section
      aria-label="Portfolio statistics"
      className="relative py-10 sm:py-14 lg:py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* قاب شیشه‌ای اصلی */}
        <div
          className="
            relative isolate overflow-hidden
            rounded-[28px]
            border border-emerald-900/10
            dark:border-emerald-300/10
            bg-white/65 dark:bg-white/[0.035]
            backdrop-blur-xl
            shadow-[0_20px_65px_-35px_rgba(15,118,110,0.18)]
            dark:shadow-[0_20px_70px_-35px_rgba(0,0,0,0.55)]
          "
        >
          {/* نورپردازی ظریف پس‌زمینه */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -top-28 -left-20
              h-64 w-64 rounded-full
              bg-emerald-400/10
              dark:bg-emerald-400/[0.07]
              blur-3xl
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -bottom-28 -right-20
              h-64 w-64 rounded-full
              bg-cyan-400/10
              dark:bg-cyan-400/[0.07]
              blur-3xl
            "
          />

          {/* آمار */}
          <div className="relative grid grid-cols-2 lg:grid-cols-4">
            {stats.map((item, index) => (
              <div
                key={index}
                className={`
                  group relative
                  flex flex-col items-center justify-center
                  px-4 py-10
                  sm:px-6 sm:py-12
                  lg:py-14
                  text-center
                  transition-colors duration-500
                  hover:bg-emerald-500/[0.035]
                  dark:hover:bg-emerald-300/[0.035]

                  ${index % 2 === 0
                    ? "border-r border-border/60 lg:border-r-0"
                    : ""
                  }

                  ${index < 2
                    ? "border-b border-border/60 lg:border-b-0"
                    : ""
                  }

                  ${index < 3
                    ? "lg:border-r lg:border-border/60"
                    : ""
                  }
                `}
              >
                {/* عدد */}
                <div
                  className="
                    flex items-baseline
                    gap-0.5
                    text-[38px] sm:text-[48px]
                    lg:text-[54px]
                    font-extrabold
                    tracking-tight
                    tabular-nums
                    bg-gradient-to-r
                    from-emerald-700
                    via-teal-600
                    to-cyan-600
                    dark:from-emerald-300
                    dark:via-teal-300
                    dark:to-cyan-300
                    bg-clip-text text-transparent
                  "
                >
                  <CountUp
                    end={item.num}
                    duration={2.5}
                    enableScrollSpy
                    scrollSpyOnce
                    separator=","
                  />

                  <span className="text-[24px] sm:text-[30px]">
                    +
                  </span>
                </div>

                {/* خط تزئینی */}
                <div
                  aria-hidden="true"
                  className="
                    mt-3 h-[3px] w-8
                    rounded-full
                    bg-gradient-to-r
                    from-emerald-500 to-cyan-500
                    transition-all duration-500
                    group-hover:w-14
                  "
                />

                {/* عنوان */}
                <p
                  className="
                    mt-4
                    max-w-[180px]
                    text-sm sm:text-base
                    leading-relaxed
                    font-medium
                    text-slate-600
                    dark:text-slate-400
                    transition-colors duration-300
                    group-hover:text-emerald-800
                    dark:group-hover:text-emerald-200
                  "
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;
