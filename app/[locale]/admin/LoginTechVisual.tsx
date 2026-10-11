import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiOpenai,
  SiAnthropic,
  SiNodedotjs,
} from "react-icons/si";
import { Code2, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

type TechIcon = ComponentType<{
  className?: string;
  size?: number;
}>;

const technologies: {
  name: string;
  Icon: TechIcon;
  position: string;
  delay: string;
  color: string;
}[] = [
  {
    name: "JavaScript",
    Icon: SiJavascript,
    position: "left-[3%] top-[17%]",
    delay: "0s",
    color: "text-yellow-400",
  },
  {
    name: "TypeScript",
    Icon: SiTypescript,
    position: "right-[5%] top-[13%]",
    delay: "-1.2s",
    color: "text-blue-400",
  },
  {
    name: "React",
    Icon: SiReact,
    position: "left-[8%] top-[55%]",
    delay: "-2.1s",
    color: "text-cyan-400",
  },
  {
    name: "Next.js",
    Icon: SiNextdotjs,
    position: "right-[4%] top-[53%]",
    delay: "-0.7s",
    color: "text-slate-100",
  },
  {
    name: "ChatGPT",
    Icon: SiOpenai,
    position: "left-[23%] top-[4%]",
    delay: "-2.8s",
    color: "text-emerald-300",
  },
  {
    name: "Claude",
    Icon: SiAnthropic,
    position: "right-[20%] bottom-[5%]",
    delay: "-1.7s",
    color: "text-orange-300",
  },
  {
    name: "Node.js",
    Icon: SiNodedotjs,
    position: "left-[5%] bottom-[9%]",
    delay: "-3s",
    color: "text-green-400",
  },
];

export default function LoginTechVisual() {
  return (
    <div
      aria-hidden="true"
      className="
        relative mx-auto
        h-[340px] w-full max-w-[470px]
        overflow-hidden
        rounded-[28px]
        border border-white/10
        bg-[#0c1720]
        sm:h-[390px]
      "
    >
      {/* Background glow */}
      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          size-[280px] -translate-x-1/2 -translate-y-1/2
          rounded-full bg-emerald-400/15 blur-[75px]
        "
      />

      {/* Orbit rings */}
      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          size-[250px]
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          border border-dashed border-emerald-400/20
        "
      />

      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          h-[180px] w-[330px]
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          border border-dashed border-cyan-400/15
        "
      />

      {/* Central code card */}
      <div
        className="
          absolute left-1/2 top-1/2 z-10
          flex h-32 w-40
          -translate-x-1/2 -translate-y-1/2
          flex-col items-center justify-center
          gap-2 rounded-[24px]
          border border-emerald-400/30
          bg-[#13242c]/95
          shadow-[0_20px_60px_rgba(16,185,129,0.15)]
          backdrop-blur-xl
          sm:h-36 sm:w-44
        "
      >
        <div
          className="
            flex size-12 items-center justify-center
            rounded-2xl bg-emerald-400/10
            text-emerald-300
          "
        >
          <Code2 size={28} strokeWidth={1.7} />
        </div>

        <span className="text-sm font-bold text-white">AI × Development</span>

        <span
          className="
            flex items-center gap-1
            text-[10px] text-emerald-300/80
          "
        >
          <Sparkles size={11} />
          Building the future
        </span>
      </div>

      {/* Floating technology badges */}
      {technologies.map((tech) => {
        const Icon = tech.Icon;

        return (
          <div key={tech.name} className={`absolute z-20 ${tech.position}`}>
            <div
              className="
                tech-float
                flex items-center gap-2
                rounded-2xl
                border border-white/10
                bg-[#192b35]/90
                px-3 py-2.5
                shadow-[0_10px_30px_rgba(0,0,0,0.2)]
                backdrop-blur-xl
              "
              style={{
                animationDelay: tech.delay,
              }}
            >
              <Icon size={20} className={tech.color} />

              <span
                className="
                  text-[11px] font-semibold
                  text-slate-100
                "
              >
                {tech.name}
              </span>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes techFloating {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .tech-float {
          animation: techFloating 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .tech-float {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
