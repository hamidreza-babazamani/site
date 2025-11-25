"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

function Photo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  const strokeColor = theme === "dark" ? "#00ff99" : "#00aaff";
  return (
    <div className="w-full h-full relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { delay: 2, duration: 0.4, ease: "easeIn" },
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 2.4, duration: 0.4, ease: "easeInOut" },
          }}
          className="relative w-[298px] h-[298px] xl:w-[498px] xl:h-[498px]"
        >
          <Image
            src="/images/kamyar.jpg"
            priority
            quality={100}
            fill
            alt="Portrait of Kamyar Kamali, Front-end Developer"
            className="object-cover rounded-[100%]"
          />

          <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-10 rounded-[100%]" />
          <motion.svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             w-[320px] h-[320px] sm:w-[350px] sm:h-[350px] 
             md:w-[420px] md:h-[420px] 
             xl:w-[520px] xl:h-[520px] 
             z-20 pointer-events-none"
            viewBox="0 0 550 550"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.circle
              cx="275"
              cy="275"
              r="270"
              stroke={strokeColor}
              strokeWidth="4"
              initial={{ strokeDasharray: "24 10 0 0" }}
              animate={{
                strokeDasharray: ["15 120 25 25", "16 25 92 72", "4,250 22 22"],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "loop",
              }}
            />
          </motion.svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Photo;
