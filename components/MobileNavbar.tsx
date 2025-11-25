"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CiMenuFries } from "react-icons/ci";
import { RiMenu2Line } from "react-icons/ri";
import { useLocale, useTranslations } from "next-intl";

function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false); // ✅ کنترل باز و بسته بودن منو
  const pathname = usePathname();
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const segments = pathname.split("/");
  const currentPath =
    segments.length > 2 ? `/${segments.slice(2).join("/")}` : "/";

  const links = [
    { name: t("links.home"), path: "/" },
    { name: t("links.services"), path: "/services" },
    { name: t("links.resume"), path: "/resume" },
    { name: t("links.work"), path: "/work" },
    { name: t("links.contact"), path: "/contact" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="flex justify-center items-center">
        {locale === "en" ? (
          <CiMenuFries className="text-[32px] text-gray-400 cursor-pointer" />
        ) : (
          <RiMenu2Line className="text-[32px] text-gray-400 cursor-pointer" />
        )}
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        {/* لوگو */}
        <div className="mt-7 text-left">
          <Link
            href="/"
            onClick={() => setIsOpen(false)} // ✅ بستن منو بعد از کلیک روی لوگو
            className="xl:text-4xl text-2xl text-gray-900 dark:text-white p-2 font-semibold"
          >
            Kamyar<span className="text-green-500 text-4xl">.</span>Dev
          </Link>
        </div>

        <nav className="flex flex-col items-center justify-center gap-9 mt-8">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-gray-900 dark:text-white ${
                link.path === currentPath &&
                "text-green-500 border-b-2 border-green-500 capitalize hover:text-green-600 ease-in-out duration-200"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavbar;
