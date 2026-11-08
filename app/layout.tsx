import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/media";
import { getCategories } from "@/lib/data";
import { workKeywords, workList } from "@/lib/seo";

const clash = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  weight: "200 700",
  variable: "--font-clash",
  display: "swap",
});

const general = localFont({
  src: [
    { path: "./fonts/GeneralSans-Variable.woff2", weight: "200 700", style: "normal" },
    { path: "./fonts/GeneralSans-VariableItalic.woff2", weight: "200 700", style: "italic" },
  ],
  variable: "--font-general",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

// the work list and keywords follow the category names in the database
export async function generateMetadata(): Promise<Metadata> {
  const cats = await getCategories();
  return {
    metadataBase: new URL(SITE),
    title: { default: "Cuts By Cindy — Video Editor, Los Angeles", template: "%s · Cuts By Cindy" },
    description: `Cindy Peralta is a freelance video editor in Los Angeles who cuts ${workList(cats)}. Watch the reel and the recent work.`,
    keywords: ["video editor", "Los Angeles video editor", "freelance video editor", ...workKeywords(cats), "Cindy Peralta"],
    alternates: { canonical: "/" },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 },
    openGraph: { type: "website", siteName: "Cuts By Cindy", locale: "en_US" },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // browser extensions add attributes here before React loads; that is not a mismatch worth a warning
      suppressHydrationWarning
      className={`${clash.variable} ${general.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
