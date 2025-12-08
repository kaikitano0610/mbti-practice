import type { Metadata } from "next";
import "./globals.css";
import "./lib/envSetup";

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
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
