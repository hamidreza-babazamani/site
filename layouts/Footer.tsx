import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import React from "react";
import {
  FaInstagram,
  FaTelegramPlane,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

const Footer = () => {
  const t = useTranslations("HomePage");
  return (
    <footer className="bg-gray-100 dark:bg-black dark:text-gray-300 text-gray-700 pt-10 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
        {/* توضیح */}
        <div>
          <h3 className="text-2xl font-bold mb-3">{t("footer.name")}</h3>
          <p className="text-sm dark:text-gray-300 text-gray-700 leading-6">
            {t("footer.desc")}
          </p>
        </div>

        {/* لینک‌های مفید */}
        <div>
          <h4 className="text-lg font-semibold mb-3">{t("footer.link")}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/resume"
                className="hover:text-blue-600 transition dark:text-gray-300 text-gray-700"
              >
                {t("footer.aboutme")}
              </Link>
            </li>
            <li>
              <Link href="/work" className="hover:text-blue-600 transition">
                {t("footer.project")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-600 transition">
                {t("footer.contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">{t("footer.medi")}</h4>
          <div className="flex justify-center md:justify-end gap-4 text-xl text-gray-600">
            <a
              href="https://github.com/Kamyarkamali"
              target="_blank"
              className="hover:text-black transition"
            >
              <FaGithub className="dark:text-gray-300 text-gray-700" />
            </a>
            <a
              href="https://www.linkedin.com/in/kamyar-kamali-671a5822b/"
              target="_blank"
              className="hover:text-blue-700 transition"
            >
              <FaLinkedin className="dark:text-gray-300 text-gray-700" />
            </a>
            <a
              href="https://t.me/KamDevJs"
              target="_blank"
              className="hover:text-blue-500 transition"
            >
              <FaTelegramPlane className="dark:text-gray-300 text-gray-700" />
            </a>
            <a
              href="https://www.instagram.com/kamyar_parsi0211/"
              target="_blank"
              className="hover:text-pink-500 transition"
            >
              <FaInstagram className="dark:text-gray-300 text-gray-700" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-gray-400 border-t pt-4">
        {t("footer.end")}
      </div>
    </footer>
  );
};

export default Footer;
