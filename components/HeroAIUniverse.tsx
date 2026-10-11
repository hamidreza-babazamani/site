
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiOpenai,
  SiNodedotjs,
} from "react-icons/si";
import { Code2, Sparkles, Terminal } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

type TechIcon = ComponentType<{
  className?: string;
  size?: number;
}>;

type TechItem = {
  name: string;
  Icon: TechIcon;
  position: string;
  color: string;
  glow: string;
  delay: string;
  duration: string;
  mobile?: boolean;
};

const technologies: TechItem[] = [
  {
    name: "React",
    Icon: SiReact,
    position: "left-[-2%] top-[10%] sm:left-[-5%] sm:top-[14%]",
    color: "text-[#61DAFB]",
    glow: "bg-cyan-400/15",
    delay: "-1s",
    duration: "5.5s",
  },
  {
    name: "TypeScript",
    Icon: SiTypescript,
    position: "right-[-2%] top-[8%] sm:right-[-5%] sm:top-[12%]",
    color: "text-[#3178C6]",
    glow: "bg-blue-400/15",
    delay: "-2.5s",
    duration: "6.5s",
  },
  {
    name: "JavaScript",
    Icon: SiJavascript,
    position: "left-[-5%] top-[48%] sm:left-[-9%]",
    color: "text-[#EAB308]",
    glow: "bg-yellow-400/15",
    delay: "-3s",
    duration: "6s",
  },
  {
    name: "Next.js",
    Icon: SiNextdotjs,
    position: "right-[-5%] top-[48%] sm:right-[-9%]",
    color: "text-slate-900 dark:text-white",
    glow: "bg-slate-400/15",
    delay: "-1.7s",
    duration: "5.8s",
  },
  {
    name: "OpenAI",
    Icon: SiOpenai,
    position: "left-[12%] bottom-[2%] sm:left-[8%]",
    color: "text-emerald-500",
    glow: "bg-emerald-400/15",
    delay: "-4s",
    duration: "7s",
  },
  {
    name: "Node.js",
    Icon: SiNodedotjs,
    position: "right-[12%] bottom-[2%] sm:right-[8%]",
    color: "text-[#68A063]",
    glow: "bg-green-400/15",
    delay: "-2s",
    duration: "6.2s",
  },
];

function TechBadge({ item }: { item: TechItem }) {
  const { Icon } = item;

  const animationStyle: CSSProperties = {
    animationDelay: item.delay,
    animationDuration: item.duration,
  };

  return (
    <div
      className={`absolute z-30 ${item.position}`}
      style={animationStyle}
    >
      <div className="hero-tech-float relative">
        <div
          className={`absolute -inset-2 rounded-2xl blur-xl ${item.glow}`}
        />

        <div
          className="
            relative flex items-center gap-2
            rounded-2xl border border-white/70
            bg-white/85 p-2.5
            shadow-[0_12px_35px_rgba(15,23,42,0.13)]
            backdrop-blur-xl
            dark:border-white/10
            dark:bg-[#15232e]/85
            dark:shadow-[0_12px_35px_rgba(0,0,0,0.35)]
            sm:px-3 sm:py-3
            lg:gap-2.5
          "
        >
          <Icon
            size={22}
            className={`shrink-0 ${item.color}`}
          />

          <span
            className="
              hidden text-xs font-semibold
              tracking-wide text-slate-700
              dark:text-slate-100
              lg:block
            "
          >
            {item.name}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HeroTechEcosystem() {
  return (
    <div
      aria-hidden="true"
      dir="ltr"
      className="
        pointer-events-none
        absolute inset-0 z-20
        isolate
      "
    >
      {/* Ambient glow */}
      <div
        className="
          absolute inset-[-15%]
          rounded-full
          bg-[radial-gradient(circle,rgba(16,185,129,0.13)_0%,transparent_65%)]
          blur-2xl
          dark:bg-[radial-gradient(circle,rgba(45,212,191,0.12)_0%,transparent_65%)]
        "
      />

      {/* Outer orbital ring */}
      <div
        className="
          absolute inset-[-8%]
          rounded-full
          border border-dashed
          border-emerald-500/20
          dark:border-emerald-400/20
        "
      />

      {/* Inner orbital ring */}
      <div
        className="
          absolute inset-[4%]
          rounded-full
          border border-cyan-500/10
          dark:border-cyan-400/15
        "
      />

      {/* Decorative orbital points */}
      <div
        className="
          absolute left-[13%] top-[13%]
          h-2 w-2 rounded-full
          bg-emerald-400
          shadow-[0_0_14px_rgba(52,211,153,0.8)]
        "
      />

      <div
        className="
          absolute bottom-[18%] right-[7%]
          h-1.5 w-1.5 rounded-full
          bg-cyan-400
          shadow-[0_0_12px_rgba(34,211,238,0.8)]
        "
      />

      {/* Floating technologies */}
      {technologies.map((item) => (
        <TechBadge key={item.name} item={item} />
      ))}

      {/* Code window - desktop only */}
      <div
        className="
          hero-tech-float
          absolute -left-[16%] bottom-[16%]
          z-20 hidden
          rounded-2xl border border-white/10
          bg-[#101c27]/95 p-3
          shadow-[0_15px_40px_rgba(0,0,0,0.3)]
          backdrop-blur-xl
          xl:block
        "
        style={{
          animationDuration: "7s",
          animationDelay: "-2s",
        }}
      >
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="ml-2 text-[9px] text-slate-400">
            developer.tsx
          </span>
        </div>

        <div className="font-mono text-[10px] leading-5">
          <div>
            <span className="text-purple-400">const </span>
            <span className="text-cyan-300">developer</span>
            <span className="text-white"> = {"{"}</span>
          </div>
          <div className="pl-3 text-emerald-300">
            passion: <span className="text-orange-300">&quot;building&quot;</span>,
          </div>
          <div className="pl-3 text-emerald-300">
            focus: <span className="text-orange-300">&quot;quality&quot;</span>
          </div>
          <div className="text-white">{"};"}</div>
        </div>
      </div>

      {/* AI status card - desktop only */}
      <div
        className="
          hero-tech-float
          absolute -right-[17%] top-[1%]
          z-20 hidden
          items-center gap-2.5
          rounded-2xl border
          border-emerald-200/60
          bg-white/90 px-3 py-2.5
          shadow-lg backdrop-blur-xl
          dark:border-emerald-400/15
          dark:bg-[#14242e]/90
          xl:flex
        "
        style={{
          animationDuration: "6.4s",
          animationDelay: "-3s",
        }}
      >
        <div
          className="
            flex h-8 w-8 items-center justify-center
            rounded-xl bg-emerald-500/10
          "
        >
          <Sparkles size={16} className="text-emerald-500" />
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-800 dark:text-white">
            AI × Engineering
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400">
            Creative workflow
          </p>
        </div>
      </div>

      {/* Small decorative symbols */}
      <div
        className="
          absolute -right-[7%] bottom-[24%]
          hidden text-emerald-500/40
          lg:block
        "
      >
        <Code2 size={20} />
      </div>

      <div
        className="
          absolute -left-[8%] top-[28%]
          hidden text-cyan-500/40
          lg:block
        "
      >
        <Terminal size={18} />
      </div>
    </div>
  );
}
