"use client";
import Image from "next/image";

const skills = [
  { src: "skills/html5.svg", name: "HTML" },
  { src: "skills/css.svg", name: "CSS" },
  { src: "skills/tailwindcss.svg", name: "Tailwind Css" },
  { src: "skills/mui.svg", name: "Material Ui" },
  { src: "skills/shadcnui.svg", name: "Shadcn/Ui" },
  { src: "skills/bootstrap.svg", name: "BootStrap" },
  { src: "skills/javascript.svg", name: "JavaScript" },
  { src: "skills/typescript.svg", name: "TypeScript" },
  { src: "skills/react.svg", name: "React.Js" },
  { src: "skills/nextdotjs.svg", name: "Next.Js" },
  { src: "skills/redux.svg", name: "Redux" },
  { src: "skills/nodedotjs.svg", name: "Node Js" },
  { src: "skills/express.svg", name: "express" },
  { src: "skills/reacthookform.svg", name: "React Hook Form" },
  { src: "skills/wordpress.svg", name: "Wordprees" },
  { src: "skills/elementor.svg", name: "Elementor" },
  { src: "skills/figma.svg", name: "Figma" },
  { src: "skills/graphql.svg", name: "GrapQL" },
  { src: "skills/git.svg", name: "Git" },
  { src: "skills/github.svg", name: "Github" },
];

function SkillsCircle() {
  return (
    <div className="relative mt-[4rem] overflow-hidden bg-gradient-to-r from-[#0f172a] to-[#0b1120] py-4">
      {/* نوار اول */}
      <div className="animate-scroll pt-5 flex items-center gap-10 w-max">
        {skills.map((skill, idx) => (
          <div key={idx} className="flex flex-col items-center min-w-[120px]">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md bg-gradient-to-br from-cyan-500 to-blue-500 p-2 flex justify-center items-center">
              <Image
                src={`/${skill.src}`}
                alt={skill.name}
                fill
                sizes="64px"
                className="object-contain invert"
              />
            </div>
            <span className="text-sm text-gray-400 mt-2">{skill.name}</span>
          </div>
        ))}
      </div>

      {/* نوار تکراری برای اسکرول بی‌نهایت */}
      <div className="animate-scroll flex items-center pt-5 gap-10 w-max absolute top-0 left-full">
        {skills.map((skill, idx) => (
          <div key={idx} className="flex flex-col items-center min-w-[120px]">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md bg-gradient-to-br from-cyan-500 to-blue-500 p-2 flex justify-center items-center">
              <Image
                src={`/${skill.src}`}
                alt={skill.name}
                fill
                sizes="64px"
                className="object-contain invert"
              />
            </div>
            <span className="text-sm text-gray-400 mt-2">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillsCircle;
