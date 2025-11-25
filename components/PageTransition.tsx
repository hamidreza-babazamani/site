"use client";
import React, { FC, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const PageTransition: FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(false), 800);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key={pathname}
            className="fixed inset-0 z-50 bg-white dark:bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

export default PageTransition;
