import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Sleek, premium tech font
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Excelsior Admin | Economy Suite",
  description: "Excelsior Ecosystem Autonomous Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body
        suppressHydrationWarning
        className={`${outfit.className} antialiased text-white bg-black selection:bg-blue-500/30`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
