"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import {
  BsArrowLeft,
  BsArrowRight,
  BsArrowUpRight,
  BsGithub,
} from "react-icons/bs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocale, useTranslations } from "next-intl";
import { Swiper as SwiperType } from "swiper";

function WorkePage() {
  const t = useTranslations("HomePage.project");
  const locale = useLocale();

  const projects = [
    {
      num: "01",
      category: t("category1"),
      title: t("title1"),
      description: t("description1"),
      stack: [
        { name: "HTML5" },
        { name: "CSS3" },
        { name: "Tailwind CSS" },
        { name: "JavaScript" },
        { name: "TypeScript" },
        { name: "Next.js" },
        { name: "Redux Toolkit" },
      ],
      image: "/projects/almas1.png",
      live: "https://test.almasvista.ir/",
      github: "/",
    },
    {
      num: "02",
      category: t("category2"),
      title: t("title2"),
      description: t("description2"),
      stack: [
        { name: "HTML5" },
        { name: "CSS3" },
        { name: "Tailwind CSS" },
        { name: "JavaScript" },
      ],
      image: "/projects/atrin1.png",
      live: "https://atrinkala.com/",
      github: "/",
    },
    {
      num: "03",
      category: t("category3"),
      title: t("title3"),
      description: t("description3"),
      stack: [
        { name: "HTML5" },
        { name: "CSS3" },
        { name: "Tailwind CSS" },
        { name: "JavaScript" },
        { name: "Next.js" },
      ],
      image: "/projects/1.png",
      live: "https://project-front-render.vercel.app/",
      github: "/",
    },
    {
      num: "04",
      category: t("category4"),
      title: t("title4"),
      description: t("description4"),
      stack: [
        { name: "HTML5" },
        { name: "CSS3" },
        { name: "Tailwind CSS" },
        { name: "JavaScript" },
        { name: "React.js" },
      ],
      image: "/projects/2.png",
      live: "https://cooking-tutorial-website-tw2t.vercel.app/",
      github: "/",
    },
    {
      num: "05",
      category: t("category5"),
      title: t("title5"),
      description: t("description5"),
      stack: [
        { name: "HTML5" },
        { name: "CSS3" },
        { name: "Tailwind CSS" },
        { name: "JavaScript" },
        { name: "Next.js" },
      ],
      image: "/projects/3.png",
      live: "https://psychiatry-project.vercel.app/",
      github: "/",
    },
    {
      num: "06",
      category: t("category6"),
      title: t("title6"),
      description: t("description6"),
      stack: [
        { name: "HTML5" },
        { name: "CSS3" },
        { name: "Tailwind CSS" },
        { name: "JavaScript" },
        { name: "React.js" },
      ],
      image: "/projects/4.png",
      live: "https://project-car-germany.vercel.app/",
      github: "/",
    },
    {
      num: "07",
      category: t("category7"),
      title: t("title6"),
      description: t("description7"),
      stack: [
        { name: "HTML5" },
        { name: "CSS3" },
        { name: "Tailwind CSS" },
        { name: "JavaScript" },
        { name: "React.js" },
        { name: "Ant desain" },
      ],
      image: "/projects/rojintak.png",
      live: "https://rojin-talk-panel2-new.vercel.app/login",
      github: "/",
    },
  ];

  const [remoteProjects, setRemoteProjects] = useState<typeof projects | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/public/projects?limit=50&visible=true")
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!active || !result?.data?.length) return;
        setRemoteProjects(result.data.map((item: { title?: { fa?: string; en?: string }; shortDescription?: { fa?: string; en?: string }; description?: { fa?: string; en?: string }; images?: { url: string; alt?: { fa?: string; en?: string } }[]; liveUrl?: string; repositoryUrl?: string; technologies?: string[] }, index: number) => ({
          num: String(index + 1).padStart(2, "0"),
          category: item.technologies?.join(" · ") || "Software project",
          title: item.title?.[locale as "fa" | "en"] || item.title?.en || item.title?.fa || "Project",
          description: item.description?.[locale as "fa" | "en"] || item.description?.en || item.description?.fa || item.shortDescription?.[locale as "fa" | "en"] || item.shortDescription?.en || item.shortDescription?.fa || "",
          stack: (item.technologies || []).map((name) => ({ name })),
          image: item.images?.[0]?.url || "/projects/almas1.png",
          live: item.liveUrl || "#",
          github: item.repositoryUrl || "#",
        })));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [locale]);

  const displayedProjects = remoteProjects || projects;
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const project = displayedProjects[Math.min(activeIndex, displayedProjects.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80vh] py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900 transition-colors duration-500"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-10 items-center">
          {/* Slider Section */}
          <div className="w-full xl:w-1/2 flex flex-col items-center">
            <Swiper
              spaceBetween={30}
              slidesPerView={1}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              className="h-[400px] md:h-[500px] w-full"
            >
              {displayedProjects.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain"
                      priority={index === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            <div className="mt-4 flex gap-6">
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-md transition"
              >
                <BsArrowRight className="text-xl" />
              </button>
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-md transition"
              >
                <BsArrowLeft className="text-xl" />
              </button>
            </div>
          </div>

          {/* Text Section */}
          <div className="w-full xl:w-1/2 flex flex-col gap-6">
            <span className="text-6xl font-extrabold text-green-500">
              {project.num}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-white capitalize">
              {project.category}
            </h2>

            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-base sm:text-lg">
              {project.description}
            </p>

            {/* Stack List */}
            <div className="flex flex-wrap gap-2">
              {project.stack.map((item, index) => (
                <span
                  key={index}
                  className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {item.name}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-300 dark:border-neutral-700 pt-4" />

            {/* Buttons */}
            <div className="flex gap-4">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={project.live} target="_blank">
                      <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center hover:bg-green-500 dark:hover:bg-green-600 transition-colors">
                        <BsArrowUpRight className="text-2xl text-green-800 dark:text-white" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("live")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={project.github} target="_blank">
                      <div className="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">
                        <BsGithub className="text-2xl text-neutral-800 dark:text-white" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkePage;
