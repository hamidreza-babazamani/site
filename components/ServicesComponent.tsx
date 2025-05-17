"use client";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowDownRight } from "react-icons/bs";

function ServicesComponent() {
  const t = useTranslations("HomePage");

  const services = [
    {
      title: t("services.title1"),
      description: t("services.desc1"),
      num: "01",
      href: "",
    },
    {
      title: t("services.title2"),
      description: t("services.desc2"),
      num: "02",
      href: "",
    },
    {
      title: t("services.title3"),
      description: t("services.desc3"),
      num: "03",
      href: "",
    },
    {
      title: t("services.title4"),
      description: t("services.desc4"),
      num: "04",
      href: "",
    },
    {
      title: t("services.title5"),
      description: t("services.desc5"),
      num: "05",
      href: "",
    },
  ];

  return (
    <section className="min-h-[80vh] flex flex-col justify-center py-12 xl:py-0 px-4 md:px-0">
      <div className="container mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-[40px] md:gap-[60px]"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 0.2, duration: 0.4, ease: "easeIn" },
          }}
        >
          {services.map((service, index) => {
            return (
              <article
                key={index}
                className="flex flex-col justify-center gap-4 mt-8 group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white group-hover:text-outline-hover transition-all duration-300">
                    {service.num}
                  </div>
                  <Link
                    href={service.href}
                    aria-label={`Go to ${service.title}`}
                    className="w-10 h-10 md:w-[70px] md:h-[70px] rounded-full bg-gray-500 group-hover:bg-green-500 transition-all duration-500 flex justify-center items-center hover:-rotate-45"
                  >
                    <BsArrowDownRight className="text-xl md:text-3xl text-gray-900 dark:text-white" />
                  </Link>
                </div>

                <h3 className="text-xl md:text-[42px] font-bold leading-tight text-gray-900 dark:text-white group-hover:text-green-500 transition-all duration-300">
                  {service.title}
                </h3>

                <p className="text-sm md:text-base text-gray-700 dark:text-white">
                  {service.description}
                </p>

                <hr className="border-b border-white/20 w-full" />
              </article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesComponent;
