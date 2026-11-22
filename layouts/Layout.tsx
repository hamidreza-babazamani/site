"use client";

import { Props } from "@/types/type";
import { FC } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";
import ContactButton from "@/components/ContactButton";
import CollaborationModal from "@/components/CollaborationModal";
import type { PublicMedia } from "@/lib/services/public-portfolio";

type LayoutProps = Props & { siteLogo?: PublicMedia };

const Layout: FC<LayoutProps> = ({ children, siteLogo }) => {
  const pathname = usePathname();
  const locale = useLocale();
  if (pathname.includes("/admin") || pathname.includes("/resume/print")) {
    return <>{children}</>;
  }
  return (
    <>
      <Toaster
        position={locale === "fa" ? "bottom-left" : "bottom-right"}
        toastOptions={{
          duration: 3800,
          className:
            "!rounded-2xl !border !border-slate-200 !bg-white !text-slate-900 dark:!border-white/10 dark:!bg-[#101820] dark:!text-white",
        }}
      />
      <Header siteLogo={siteLogo} />

      <main className="h-fit">{children}</main>

      <Footer siteLogo={siteLogo} />
      <ContactButton />
      <CollaborationModal />
    </>
  );
};

export default Layout;
