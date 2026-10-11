"use client";

import type { ComponentType } from "react";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiOpenai,
  SiNodedotjs,
} from "react-icons/si";
import { SiClaude } from "react-icons/si";

type IconType = ComponentType<{
  className?: string;
  size?: number;
}>;

type Technology = {
  name: string;
  Icon: IconType;
  position: string;
  color: string;
  delay: string;
  duration: string;
  hideOnMobile?: boolean;
};

const technologies: Technology[] = [
  {
    name: "JavaScript",
    Icon: SiJavascript,
    position: "left-[2%] top-[10%]",
    color: "text-yellow-400",
    delay: "0s",
    duration: "5s",
  },
  {
    name: "TypeScript",
    Icon: SiTypescript,
    position: "right-[0%] top-[12%]",
    color: "text-blue-400",
    delay: "-1.5s",
    duration: "6s",
  },
  {
    name: "React",
    Icon: SiReact,
    position: "-left-[5%] top-[47%]",
    color: "text-cyan-400",
    delay: "-2s",
    duration: "5.5s",
  },
  {
    name: "Next.js",
    Icon: SiNextdotjs,
    position: "-right-[5%] top-[48%]",
    color: "text-slate-900 dark:text-white",
    delay: "-0.8s",
    duration: "6.5s",
  },
  {
    name: "ChatGPT",
    Icon: SiOpenai,
    position: "left-[25%] -top-[5%]",
    color: "text-emerald-500",
    delay: "-2.7s",
    duration: "6s",
    hideOnMobile: true,
  },
  {
    name: "Node.js",
    Icon: SiNodedotjs,
    position: "left-[8%] bottom-[5%]",
    color: "text-green-500",
    delay: "-1.8s",
    duration: "5.8s",
    hideOnMobile: true,
  },
  {
    name: "Claude",
    Icon: SiClaude,
    position: "right-[8%] bottom-[5%]",
    color: "text-orange-400",
    delay: "-3s",
    duration: "6.3s",
    hideOnMobile: true,
  },
];

export default function HeroTechEcosystem() {
  return (
    <div
      aria-label="Technology ecosystem"
      className="pointer-events-none absolute inset-0 z-20"
    >
      {/* Orbit rings */}
      <div
        aria-hidden="true"
        className="
          absolute inset-[-4%]
          rounded-full
          border border-dashed
          border-emerald-500/20
          dark:border-emerald-400/20
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute inset-[7%]
          rounded-full
          border border-cyan-500/10
          dark:border-cyan-400/15
        "
      />

      {/* Floating technology cards */}
      {technologies.map((tech) => {
        const Icon = tech.Icon;

        return (
          <div
            key={tech.name}
            className={`
              absolute
              ${tech.position}
              ${tech.hideOnMobile ? "hidden sm:block" : ""}
            `}
          >
            <div
              className="
                hero-tech-float
                flex items-center gap-2
                rounded-xl
                border border-slate-200/80
                bg-white/90
                px-2.5 py-2
                shadow-[0_8px_25px_rgba(15,23,42,0.12)]
                backdrop-blur-xl
                dark:border-white/15
                dark:bg-[#17242f]/90
                dark:shadow-[0_8px_25px_rgba(0,0,0,0.25)]
                sm:rounded-2xl
                sm:px-3 sm:py-2.5
              "
              style={{
                animationDelay: tech.delay,
                animationDuration: tech.duration,
              }}
            >
              <Icon size={20} className={tech.color} />

              <span
                className="
                  hidden text-xs font-semibold
                  text-slate-700
                  dark:text-slate-100
                  lg:block
                "
              >
                {tech.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
