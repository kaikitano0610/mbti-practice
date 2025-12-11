import type { Metadata } from "next";
import "./globals.css";
import "./lib/envSetup";
import { Mochiy_Pop_P_One } from "next/font/google";

const mochiy = Mochiy_Pop_P_One({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "mbti会話練習アプリ",
  description: "気になるあの子とうまくしゃべれないそこの君！気になる相手のmbtiを入力して会話練習をしようじゃないか！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mochiy.className} antialiased`}>{children}</body>
    </html>
  );
}
