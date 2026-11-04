"use client";

import { Props } from "@/types/type";
import { FC } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import ContactButton from "@/components/ContactButton";
import type { PublicMedia } from "@/lib/services/public-portfolio";

type LayoutProps = Props & { siteLogo?: PublicMedia };

const Layout: FC<LayoutProps> = ({ children, siteLogo }) => {
  const pathname = usePathname();
  if (pathname.includes("/admin")) return <>{children}</>;
  return (
    <>
      <header>
        <Header siteLogo={siteLogo} />
      </header>

      <main className="h-fit">{children}</main>

      <footer>
        <Footer siteLogo={siteLogo} />
      </footer>
      <div>
        <ContactButton />
      </div>
    </>
  );
};

export default Layout;
