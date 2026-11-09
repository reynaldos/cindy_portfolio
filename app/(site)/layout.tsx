import { BayFrame } from "@/components/bay/frame";
import { Splash } from "@/components/bay/splash";
import { getCategories, getProfile, getRecentWork } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, categories, recent] = await Promise.all([getProfile(), getCategories(), getRecentWork()]);
  return (
    <>
      <Splash brand={profile?.brand ?? "Cuts By Cindy"} name={profile?.name ?? "Cindy Peralta"} city={profile?.location} />
      <BayFrame profile={profile} categories={categories} recent={recent}>
        {children}
      </BayFrame>
    </>
  );
}
