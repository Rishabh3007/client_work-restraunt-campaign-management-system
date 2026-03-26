import { type Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menu | One Bite | Kiyu Foods",
  description:
    "Browse the complete One Bite (Kiyu Foods) menu in Pimple Saudagar. From signature burgers to crispy waffles, satiate your crave for hunger. Fresh food, bold flavours.",
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
