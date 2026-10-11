import { FaGithub, FaLinkedinIn } from "react-icons/fa";

import { cn } from "@/lib/utils";

interface SocialProps {
  containerStyle?: string;
  iconStyle?: string;
}

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/Kamyarkamali",
    icon: FaGithub,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/kamyar-kamali-671a5822b/",
    icon: FaLinkedinIn,
  },
] as const;

export default function Social({ containerStyle, iconStyle }: SocialProps) {
  return (
    <div
      aria-label="Social media profiles"
      className={cn("flex flex-wrap items-center gap-3", containerStyle)}
    >
      {socialLinks.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit my ${name} profile`}
          title={name}
          className={cn(
            `
              group relative
              inline-flex size-11
              shrink-0 items-center justify-center
              rounded-xl
              border border-emerald-900/10
              bg-white/70
              text-slate-600
              shadow-[0_4px_16px_rgba(15,118,110,0.05)]
              backdrop-blur-md

              transition-[color,background-color,border-color,box-shadow,transform]
              duration-300 ease-out

              hover:-translate-y-1
              hover:border-emerald-500/35
              hover:bg-emerald-500/10
              hover:text-emerald-700
              hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-emerald-500/60
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[#f8fafc]

              dark:border-white/10
              dark:bg-white/[0.05]
              dark:text-slate-300
              dark:shadow-none

              dark:hover:border-emerald-400/35
              dark:hover:bg-emerald-400/10
              dark:hover:text-emerald-300
              dark:hover:shadow-[0_8px_25px_rgba(16,185,129,0.10)]
              dark:focus-visible:ring-offset-[#0c1118]

              motion-reduce:transform-none
              motion-reduce:transition-none
            `,
            iconStyle,
          )}
        >
          <Icon
            size={19}
            aria-hidden="true"
            className="
              transition-transform duration-300
              group-hover:scale-110
              motion-reduce:transform-none
              motion-reduce:transition-none
            "
          />

          {/* Tooltip */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute bottom-full left-1/2
              mb-3 -translate-x-1/2 translate-y-1
              whitespace-nowrap
              rounded-lg
              border border-slate-200/80
              bg-white/95
              px-2.5 py-1.5
              text-[11px] font-medium
              text-slate-700
              opacity-0
              shadow-lg
              backdrop-blur-md
              transition-[opacity,transform]
              duration-200

              group-hover:translate-y-0
              group-hover:opacity-100
              group-focus-visible:translate-y-0
              group-focus-visible:opacity-100

              dark:border-white/10
              dark:bg-[#19232e]/95
              dark:text-slate-200

              motion-reduce:transition-none
            "
          >
            {name}
          </span>
        </a>
      ))}
    </div>
  );
}
