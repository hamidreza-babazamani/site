"use client";
import { motion } from "framer-motion";
import Image from "next/image";

function Photo() {
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
          className="relative w-[298px] h-[298px] xl:w-[498px] xl:h-[498px] rounded-2xl overflow-hidden"
        >
          {/* عکس */}
          <Image
            src="/images/kamyar.jpg"
            priority
            quality={100}
            fill
            alt="Kamyar kamali"
            className="object-cover rounded-2xl"
          />

          <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-10 rounded-2xl" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Photo;
