"use client";
import React from "react";
import {
  FaHtml5,
  FaCss3,
  FaJs,
  FaReact,
  FaFigma,
  FaNodeJs,
  FaBootstrap,
  FaDatabase,
} from "react-icons/fa";
import { GrGraphQl } from "react-icons/gr";

import { RiNextjsLine, RiTailwindCssFill } from "react-icons/ri";
import { SiMongodb, SiReactquery, SiRedux, SiExpress } from "react-icons/si";
import { BiLogoTypescript } from "react-icons/bi";
import { useLocale, useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ScrollArea } from "@/components/ui/scroll-area";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function ResumehComponents() {
  const locale = useLocale();
  const t = useTranslations("HomePage.Resume");
  const resumeInfo = [
    { key: t("info.aboutus"), value: t("info.descriptionme") },
    { key: t("info.fullName"), value: t("info.fullNameValue") },
    { key: t("info.email"), value: "kamyarkamali021@gmail.com" },
    { key: t("info.phone"), value: t("info.phoneValue") },
    { key: t("info.telegram"), value: "@KamDevJs" },
    {
      key: t("info.linkedin"),
      value: "https://www.linkedin.com/in/kamyar-kamali-671a5822b/",
    },
    { key: t("info.languages"), value: t("info.languagesValue") },
    { key: t("info.location"), value: t("info.locationValue") },
    { key: t("info.jobTitle"), value: t("info.jobTitleValue") },
    { key: t("info.experience"), value: t("info.experienceValue") },
    {
      key: t("info.techStack"),
      value: t("info.techStackValue"),
    },
  ];

  const experience = {
    icon: "",
    title: t("info.title"),
    description: t("description"),

    items: [
      {
        comany: t("info.company1"),
        position: t("info.position1"),
      },
      {
        comany: t("info.company2"),
        position: t("info.position2"),
      },
      {
        comany: t("info.company3"),
        position: t("info.position3"),
      },
      {
        comany: t("info.company4"),
        position: t("info.position4"),
      },
    ],
  };

  const skills = {
    title: t("title2"),
    description: t("info.myskills"),
    skillList: [
      {
        icon: <FaHtml5 />,
        name: "HTML5",
      },
      {
        icon: <FaCss3 />,
        name: "CSS3",
      },
      {
        icon: <RiTailwindCssFill />,
        name: "Tailwind Css",
      },
      {
        icon: <FaBootstrap />,
        name: "BootStrap",
      },
      {
        icon: <FaJs />,
        name: "JavaScript",
      },
      {
        icon: <BiLogoTypescript />,
        name: "TypeScript",
      },
      {
        icon: <FaReact />,
        name: "React.Js",
      },
      {
        icon: <SiReactquery />,
        name: "React Query",
      },
      {
        icon: <SiRedux />,
        name: "Redux and Redux toolkit",
      },
      {
        icon: <RiNextjsLine />,
        name: "Next.Js",
      },
      {
        icon: <GrGraphQl />,
        name: "GraphQL",
      },
      {
        icon: <FaNodeJs />,
        name: "Node.Js",
      },
      {
        icon: <SiExpress />,
        name: "Express",
      },
      {
        icon: <SiMongodb />,
        name: "MongoDB",
      },
      {
        icon: <FaDatabase />,
        name: "NoSQL",
      },
      {
        icon: <FaFigma />,
        name: "Figma",
      },
    ],
  };

  return (
    <motion.div
      className="min-h-[80vh] flex items-center justify-center py-12 xl:py-0"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 2.4, duration: 0.4, ease: "easeIn" },
      }}
    >
      <div className="container mx-auto mt-[3rem]">
        <Tabs
          className="flex flex-col xl:flex-row gap-[60px]"
          defaultValue="experience"
        >
          <TabsList className="flex flex-col gap-6 w-full max-w-[380px] mx-auto xl:mx-auto">
            <TabsTrigger value={t("info.experience")}>
              {t("info.experience")}
            </TabsTrigger>

            <TabsTrigger value={t("info.Skills")}>
              {t("info.Skills")}
            </TabsTrigger>
            <TabsTrigger value={t("info.About")}>{t("info.About")}</TabsTrigger>
          </TabsList>

          {/* content */}

          <div className="min-h-[70vh] w-full">
            <TabsContent className="w-full" value={t("info.experience")}>
              <div className="flex flex-col gap-[30px] text-center">
                <div className="flex flex-col items-center gap-6 text-center">
                  <h3
                    className={`${
                      locale === "fa" ? "text-center" : ""
                    } text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400`}
                  >
                    {experience.title}
                  </h3>
                  <p
                    className={`${
                      locale === "fa" ? "text-center" : ""
                    } max-w-[600px] text-gray-600 dark:text-gray-300 text-base leading-relaxed`}
                  >
                    {experience.description}
                  </p>
                </div>

                <ScrollArea className="w-full px-4 sm:px-0">
                  <ul className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-w-[800px] mx-auto">
                    {experience.items.map((item, index) => (
                      <li
                        key={index}
                        className="relative overflow-hidden group bg-white dark:bg-zinc-800 shadow-md rounded-xl p-4 border border-gray-200 dark:border-zinc-700 transition-transform duration-300 hover:shadow-xl"
                      >
                        {/* افکت برق زدن */}
                        <div className="absolute inset-0 z-0 pointer-events-none shimmer-layer" />

                        <div className="relative z-10">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {item.comany}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {item.position}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent className="w-full" value={t("info.Skills")}>
              <div className="flex flex-col gap-[30px]">
                {/* Title & Description */}
                <div className="flex flex-col gap-[30px] text-center xl:text-left px-4 sm:px-6 md:px-8">
                  <h3
                    className={cn(
                      locale === "fa" && "text-center",
                      "text-4xl font-extrabold",
                      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
                      "dark:from-blue-400 dark:via-purple-400 dark:to-pink-400",
                      "bg-clip-text text-transparent"
                    )}
                  >
                    {skills.title}
                  </h3>

                  <p
                    className={cn(
                      locale === "fa" && "text-right",
                      "max-w-[800px] mx-auto xl:mx-0",
                      "text-sm sm:text-base leading-relaxed",
                      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
                      "bg-clip-text text-transparent"
                    )}
                  >
                    {skills.description}
                  </p>
                </div>

                {/* Skills Grid */}
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 xl:gap-[30px] gap-4 sm:gap-6 px-4 sm:px-6 md:px-8">
                  {skills.skillList.map((item, index) => (
                    <li key={index}>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger className="w-full h-[100px] sm:h-[120px] xl:h-[150px] bg-[#232329] dark:bg-zinc-800 rounded-xl flex justify-center items-center group transition hover:scale-105">
                            <div className="text-5xl sm:text-4xl xl:text-6xl group-hover:text-green-500 transition-all duration-300">
                              {item.icon}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent className="w-full" value={t("info.About")}>
              <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
                <h3
                  className={cn(
                    locale === "fa" ? "text-right" : "text-left",
                    "text-4xl font-extrabold",
                    "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
                    "dark:from-blue-400 dark:via-purple-400 dark:to-pink-400",
                    "bg-clip-text text-transparent",
                    "animate-gradient-x"
                  )}
                >
                  {t("info.About")}
                </h3>

                <p
                  className={cn(
                    locale === "fa" ? "text-right" : "text-left",
                    "bg-white/10 dark:bg-zinc-800/70",
                    "p-4 rounded-lg",
                    "text-base sm:text-lg leading-[45px]",
                    "text-gray-800 dark:text-gray-200",
                    "max-w-full sm:max-w-[700px]",
                    "shadow-md"
                  )}
                >
                  {t("info.descriptionme")}
                </p>

                <div>
                  {resumeInfo
                    .filter(({ key }) => key !== t("info.aboutus"))
                    .map(({ key, value }, index) => {
                      let content: React.ReactNode = value;

                      if (key === t("info.phone")) {
                        content = (
                          <a
                            href={`tel:${value.replace(/\D/g, "")}`}
                            className="text-blue-600 hover:underline"
                          >
                            {value}
                          </a>
                        );
                      } else if (key === t("info.email")) {
                        const cleanEmail = value.trim();
                        content = (
                          <a
                            href={`mailto:${cleanEmail}`}
                            className="text-blue-600 hover:underline"
                          >
                            {cleanEmail}
                          </a>
                        );
                      } else if (key === t("info.telegram")) {
                        const telegramId = value.startsWith("@")
                          ? value.slice(1)
                          : value;
                        content = (
                          <a
                            href={`https://t.me/${telegramId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {value}
                          </a>
                        );
                      } else if (key === t("info.linkedin")) {
                        const linkedinUrl = value.startsWith("http")
                          ? value
                          : `https://${value}`;
                        content = (
                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        );
                      }

                      return (
                        <div
                          key={index}
                          className={`
            flex flex-col sm:flex-row justify-between md:items-start sm:items-center
            py-3 border-b last:border-b-0
            ${locale === "fa" ? "sm:flex-row-reverse text-right" : "text-left"}
          `}
                        >
                          <span
                            className={`
              font-extrabold text-lg 
              bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
              dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 
              bg-clip-text text-transparent
              animate-gradient-x
              sm:min-w-[120px]
            `}
                          >
                            {key}
                          </span>
                          <span className="mt-1 sm:mt-0 text-gray-900 dark:text-gray-300 text-base sm:max-w-[70%]">
                            {content}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
}

export default ResumehComponents;
