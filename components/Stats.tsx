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
    <section className="py-10  md:py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400 dark:from-lime-300 dark:to-emerald-300">
                <CountUp end={item.num} duration={3} delay={0.3} />
              </h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-[140px]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
