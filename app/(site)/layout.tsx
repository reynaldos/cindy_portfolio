import { BayFrame } from "@/components/bay/frame";
import { getCategories, getProfile, getRecentWork } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, categories, recent] = await Promise.all([getProfile(), getCategories(), getRecentWork()]);
  return (
    <BayFrame profile={profile} categories={categories} recent={recent}>
      {children}
    </BayFrame>
  );
}
