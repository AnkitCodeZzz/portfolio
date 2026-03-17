import type { Metadata } from "next";
import { Lora, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ankit Mandal — Portfolio",
  description: "Designer & design engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${geist.variable} ${geistMono.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}