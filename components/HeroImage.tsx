"use client";

import type { HeroImageProps } from "@/types/type";
import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/images/kamyar.jpg";

function Portrait({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  const imageSource = failed ? FALLBACK_IMAGE : src;

  return (
    <Image
      src={imageSource}
      alt={alt}
      fill
      priority
      quality={85}
      sizes="(max-width: 640px) 70vw, (max-width: 1024px) 38vw, 400px"
      className="
        object-cover
        object-center
        transition-transform
        duration-700
        ease-out
        motion-safe:group-hover:scale-[1.045]
        motion-reduce:transition-none
      "
      onError={() => {
        if (imageSource !== FALLBACK_IMAGE) {
          setFailed(true);
        }
      }}
    />
  );
}

export default function HeroImage({ src, alt }: HeroImageProps) {
  const imageSource = src || FALLBACK_IMAGE;

  return (
    <div
      className="
        group relative isolate
        mx-auto aspect-square
        w-full max-w-[500px]
        select-none
      "
    >
      {/* Outer atmospheric glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-[6%] -z-20
          rounded-full
          bg-emerald-300/30
          blur-[65px]
          dark:bg-emerald-500/15
        "
      />

      {/* Secondary cyan glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-[18%] -z-10
          translate-x-[12%]
          translate-y-[8%]
          rounded-full
          bg-cyan-300/35
          blur-[45px]
          dark:bg-cyan-500/15
        "
      />

      {/* Outer orbit */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-[1%]
          rounded-full
          border border-emerald-600/15
          dark:border-emerald-300/15
        "
      />

      {/* Rotating accent ring */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-[1%]
          rounded-full
          border border-transparent
          border-t-emerald-500/60
          border-r-cyan-500/30
          dark:border-t-emerald-300/60
          dark:border-r-cyan-300/30
          motion-safe:animate-[spin_40s_linear_infinite]
        "
      />

      {/* Inner static orbit */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-[6%]
          rounded-full
          border border-dashed
          border-emerald-600/15
          dark:border-emerald-300/15
        "
      />

      {/* Decorative orbit points */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-[1%]
          motion-safe:animate-[spin_40s_linear_infinite]
        "
      >
        <span
          className="
            absolute left-1/2 top-[-3px]
            size-[7px] -translate-x-1/2
            rounded-full
            bg-emerald-500
            shadow-[0_0_14px_rgba(16,185,129,0.6)]
            dark:bg-emerald-300
          "
        />
      </div>

      {/* Floating portrait */}
      <div
        className="
          absolute inset-[11%]
          motion-safe:animate-[float_8s_ease-in-out_infinite]
        "
      >
        <div
          className="
            relative h-full w-full
            rounded-full
            bg-gradient-to-br
            from-emerald-400
            via-teal-400
            to-cyan-500
            p-[3px]
            shadow-[0_20px_65px_rgba(16,185,129,0.15)]
            dark:from-emerald-300
            dark:via-teal-400
            dark:to-cyan-400
            dark:shadow-[0_20px_70px_rgba(16,185,129,0.16)]
          "
        >
          {/* Inner border */}
          <div
            className="
              relative h-full w-full
              overflow-hidden
              rounded-full
              border-[5px]
              border-white/80
              bg-emerald-50
              dark:border-[#0c1118]/90
              dark:bg-slate-900
            "
          >
            <Portrait key={imageSource} src={imageSource} alt={alt} />

            {/* Subtle depth overlay */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute inset-0
                rounded-full
                bg-gradient-to-t
                from-slate-950/15
                via-transparent
                to-white/10
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
