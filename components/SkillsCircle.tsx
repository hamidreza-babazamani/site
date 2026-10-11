import {
  siHtml5,
  siCss,
  siJavascript,
  siTypescript,
  siReact,
  siNextdotjs,
  siRedux,
  siTailwindcss,
  siMui,
  siShadcnui,
  siBootstrap,
  siReacthookform,
  siNodedotjs,
  siExpress,
  siGraphql,
  siMongodb,
  siPostgresql,
  siGit,
  siGithub,
  siDocker,
  siPostman,
  siVercel,
  siClaude,
  siDeepseek,
  SimpleIcon,
  siVscodium,
} from "simple-icons";
import { siChatbot } from "simple-icons";

type Skill = {
  name: string;
  icon: SimpleIcon;
  category: string;
  lightColor?: string;
  darkColor?: string;
};

const skills: Skill[] = [
  { name: "HTML5", icon: siHtml5, category: "Frontend" },
  { name: "CSS3", icon: siCss, category: "Frontend" },
  { name: "JavaScript", icon: siJavascript, category: "Frontend" },
  { name: "TypeScript", icon: siTypescript, category: "Frontend" },
  { name: "React", icon: siReact, category: "Frontend" },
  {
    name: "Next.js",
    icon: siNextdotjs,
    category: "Frontend",
    lightColor: "#111827",
    darkColor: "#F8FAFC",
  },
  { name: "Redux", icon: siRedux, category: "Frontend" },
  { name: "Tailwind CSS", icon: siTailwindcss, category: "Frontend" },
  { name: "Material UI", icon: siMui, category: "Frontend" },
  {
    name: "shadcn/ui",
    icon: siShadcnui,
    category: "Frontend",
    lightColor: "#111827",
    darkColor: "#F8FAFC",
  },
  { name: "Bootstrap", icon: siBootstrap, category: "Frontend" },
  { name: "React Hook Form", icon: siReacthookform, category: "Frontend" },
  { name: "Node.js", icon: siNodedotjs, category: "Backend" },
  {
    name: "Express",
    icon: siExpress,
    category: "Backend",
    lightColor: "#374151",
    darkColor: "#E2E8F0",
  },
  { name: "GraphQL", icon: siGraphql, category: "Backend" },
  { name: "MongoDB", icon: siMongodb, category: "Database" },
  { name: "PostgreSQL", icon: siPostgresql, category: "Database" },
  { name: "Git", icon: siGit, category: "Dev Tools" },
  {
    name: "GitHub",
    icon: siGithub,
    category: "Dev Tools",
    lightColor: "#24292F",
    darkColor: "#F8FAFC",
  },
  { name: "VS Code", icon: siVscodium, category: "Dev Tools" },
  { name: "Docker", icon: siDocker, category: "Dev Tools" },
  { name: "Postman", icon: siPostman, category: "Dev Tools" },
  {
    name: "Vercel",
    icon: siVercel,
    category: "Dev Tools",
    lightColor: "#111827",
    darkColor: "#F8FAFC",
  },
  {
    name: "ChatGPT",
    icon: siChatbot,
    category: "AI Tools",
    lightColor: "#10A37F",
    darkColor: "#5EE9BA",
  },
  { name: "Claude", icon: siClaude, category: "AI Tools" },
  { name: "DeepSeek", icon: siDeepseek, category: "AI Tools" },
];

function SkillCard({ skill }: { skill: Skill }) {
  const light = skill.lightColor ?? `#${skill.icon.hex}`;
  const dark = skill.darkColor ?? light;

  return (
    <div
      className="
        group/card flex w-[128px] shrink-0
        flex-col items-center justify-center gap-3
        rounded-2xl border border-emerald-900/10
        bg-white/70 px-3 py-5
        backdrop-blur-sm
        transition-all duration-300
        hover:border-emerald-500/40
        hover:bg-emerald-50/90
        dark:border-white/10
        dark:bg-white/[0.04]
        dark:hover:border-emerald-400/30
        dark:hover:bg-emerald-400/[0.07]
        sm:w-[148px]
      "
    >
      <div
        className="
          flex h-14 w-14 items-center justify-center
          rounded-xl bg-slate-100/70
          dark:bg-white/[0.04]
          sm:h-16 sm:w-16
        "
      >
        <svg
          role="img"
          aria-label={skill.name}
          viewBox="0 0 24 24"
          className="
            h-10 w-10
            transition-transform duration-300
            motion-safe:group-hover/card:scale-110
            sm:h-12 sm:w-12
          "
          style={
            {
              "--skill-light": light,
              "--skill-dark": dark,
            } as React.CSSProperties
          }
        >
          <path
            className="fill-[var(--skill-light)] dark:fill-[var(--skill-dark)]"
            d={skill.icon.path}
          />
        </svg>
      </div>

      <span className="text-center text-xs font-semibold text-slate-800 dark:text-slate-100 sm:text-sm">
        {skill.name}
      </span>

      <span className="text-[10px] font-medium text-emerald-700/80 dark:text-emerald-300/70">
        {skill.category}
      </span>
    </div>
  );
}

export default function SkillsCircle() {
  return (
    <section
      aria-label="Technologies and tools"
      className="relative overflow-hidden py-12 sm:py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />

          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">
            Technologies & Tools
          </h2>

          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/25 to-transparent" />
        </div>

        <div
          dir="ltr"
          className="
            group/marquee relative overflow-hidden
            [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
          "
        >
          <div className="flex w-max items-stretch animate-skills-marquee motion-safe:group-hover/marquee:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 gap-4 pr-4"
              >
                {skills.map((skill) => (
                  <SkillCard key={`${copy}-${skill.name}`} skill={skill} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
