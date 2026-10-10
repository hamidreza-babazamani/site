"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import { FaPhoneAlt, FaEnvelope, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";

// Zod Schema
function getSchema(t: (key: string) => string) {
  return z.object({
    firstname: z.string().min(2, t("validations.firstnameError")),
    lastname: z.string().min(2, t("validations.lastnameError")),
    email: z.string().email(t("validations.emailError")),
    phone: z.string().min(8, t("validations.phoneError")),
    message: z.string().min(5, t("validations.messageError")),
    service: z.string().nonempty(t("validations.serviceError")),
  });
}

type FormData = z.infer<ReturnType<typeof getSchema>>;

function useWorkForm(t: (key: string) => string, locale: string) {
  const schema = getSchema(t);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const service = watch("service");

  const onSubmit = async (data: FormData) => {
    const loadingToast = toast.loading(t("contact.sending"));
    try {
      const res = await fetch("/api/public/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: `${data.firstname} ${data.lastname}`.trim(),
          email: data.email,
          subject: data.service,
          message: `${data.phone}\n\n${data.message}`,
          locale,
        }),
      });

      if (res.ok) {
        toast.success(t("contact.sucsend"), { id: loadingToast });
        reset();
      } else {
        toast.error(t("contact.errorMessage"), { id: loadingToast });
      }
    } catch {
      toast.error(t("contact.errorMessage"), { id: loadingToast });
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    reset,
    setValue,
    service,
  };
}

function WorkComponent() {
  const locale = useLocale();
  const t = useTranslations("HomePage");

  const { register, handleSubmit, errors, onSubmit, setValue, service } =
    useWorkForm(t, locale);

  const info = [
    {
      icon: <FaPhoneAlt />,
      title: t("contact.title1"),
      description: "0935478110",
      href: "tel:0935478110",
    },
    {
      icon: <FaEnvelope />,
      title: t("contact.email"),
      description: "kamyarkamali021@gmail.com",
      href: "mailto:kamyarkamali021@gmail.com",
    },
    {
      icon: <FaTelegram />,
      title: t("contact.telegram"),
      description: "@KamDevJs",
      href: "https://t.me/KamDevJs",
    },
    {
      icon: <FaWhatsapp />,
      title: t("contact.WhatsApp"),
      description: "09354378110",
      href: "https://wa.me/98935478110",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.4, duration: 0.6, ease: "easeInOut" },
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col xl:flex-row gap-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full xl:w-2/3 shadow-lg hover:shadow-xl duration-300 ease-in-out flex flex-col gap-6 p-8 bg-white dark:bg-[#1e1e22] rounded-xl transition-all"
          >
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
              {t("contact.work")}
            </h3>
            <p className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 dark:from-green-300 dark:via-blue-400 dark:to-purple-500 bg-clip-text text-transparent font-semibold text-lg">
              {t("contact.moshaver")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder={t("contact.name")}
                  {...register("firstname")}
                />
                {errors.firstname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstname.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  placeholder={t("contact.last")}
                  {...register("lastname")}
                />
                {errors.lastname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lastname.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder={t("contact.email")}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder={t("contact.title1")}
                  className={`${locale === "fa" && "placeholder:text-right"}`}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Select */}
            <div>
              <Select
                onValueChange={(value) => setValue("service", value)}
                value={service}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("contact.service")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("service")}</SelectLabel>
                    <SelectItem value="front">{t("contact.front")}</SelectItem>
                    <SelectItem value="shoping">
                      {t("contact.shoping")}
                    </SelectItem>
                    <SelectItem value="wordprees">
                      {t("contact.wordprees")}
                    </SelectItem>
                    <SelectItem value="landing">
                      {t("contact.landing")}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.service && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.service.message}
                </p>
              )}
            </div>

            {/* Textarea */}
            <div>
              <Textarea
                placeholder={t("contact.messege")}
                className="h-40"
                {...register("message")}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <Button type="submit" size="md" className="w-40">
                {t("contact.send")}
              </Button>
            </div>
          </form>

          {/* Info */}
          <div className="w-full xl:w-1/3 flex flex-col justify-start">
            <ul className="flex flex-col gap-4">
              {info.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#27272c] shadow-md transition-all hover:bg-green-50 dark:hover:bg-green-900"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 text-xl">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.title}
                      </p>
                      <h3 className="text-base font-medium text-gray-800 dark:text-white">
                        {item.description}
                      </h3>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </motion.div>
  );
}

export default WorkComponent;
