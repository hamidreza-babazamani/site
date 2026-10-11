import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { connectDatabase } from "@/lib/server/db";
import { Hero as HeroModel } from "@/lib/server/models";
import { Hero } from "@/types/type";



/**
 * دریافت server-side مستقیماً از MongoDB انجام می‌شود تا در Vercel به origin
 * درخواست‌کننده، localhost یا یک HTTP self-call وابسته نباشیم.
 * noStore باعث می‌شود محتوای وابسته به داده runtime هنگام build ذخیره نشود.
 */
export async function getPublicHero(): Promise<Hero | null> {
  noStore();
  await connectDatabase();
  const hero = await HeroModel.findOne({ key: "default", isVisible: true })
    .select("jobTitle headline description primaryCta primaryCtaUrl image isVisible")
    .lean();
  return hero ? (hero as Hero) : null;
}
