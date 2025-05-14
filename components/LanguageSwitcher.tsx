"use client";

import { usePathname, useRouter } from "next/navigation"; // درست برای App Router
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleChangeLocale = (newLocale: string) => {
    // فرض بر اینه که URL شما به شکل /en/about یا /fa/about هست
    const segments = pathname.split("/");
    segments[1] = newLocale; // زبان رو جایگزین کن
    const newPath = segments.join("/");
    router.replace(newPath);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer"
      >
        <Image
          src={
            locale === "fa" ? "/flags/flagiran.webp" : "/flags/flagamerican.png"
          }
          alt={locale}
          width={24}
          height={16}
        />
        <span>{locale.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-32 bg-white border rounded shadow-lg">
          <button
            onClick={() => handleChangeLocale("fa")}
            className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100"
          >
            <Image src="/flags/flagiran.webp" alt="FA" width={24} height={16} />
            فارسی
          </button>
          <button
            onClick={() => handleChangeLocale("en")}
            className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100"
          >
            <Image
              src="/flags/flagamerican.png"
              alt="EN"
              width={24}
              height={16}
            />
            English
          </button>
        </div>
      )}
    </div>
  );
}
