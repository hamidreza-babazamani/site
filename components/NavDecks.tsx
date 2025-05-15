"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavDecks() {
  const t = useTranslations("HomePage");

  const pathname = usePathname();

  // استخراج مسیر بدون زبان
  const segments = pathname.split("/");
  const currentPath =
    segments.length > 2 ? `/${segments.slice(2).join("/")}` : "/";

  const links = [
    {
      name: t("links.home"),
      path: "/",
    },
    {
      name: t("links.services"),
      path: "/services",
    },
    {
      name: t("links.resume"),
      path: "/resume",
    },
    {
      name: t("links.work"),
      path: "/work",
    },
    {
      name: t("links.contact"),
      path: "/contact",
    },
  ];

  return (
    <nav className="flex items-center gap-8">
      {links.map((link, index) => {
        return (
          <Link
            href={link.path}
            key={index}
            className={`text-gray-900 dark:text-white ${
              link.path === currentPath &&
              "text-green-500 border-b-2 border-green-500 capitalize hover:text-green-600 ease-in-out duration-200"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default NavDecks;
