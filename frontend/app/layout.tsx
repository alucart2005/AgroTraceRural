import type { Metadata } from "next";
import localFont from "next/font/local";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "AgroTrace Rural — Trazabilidad verificable",
    template: "%s | AgroTrace Rural",
  },
  description:
    "Pasaporte digital para productos del campo: QR + SHA-256 anclados en Stellar Testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} antialiased`}>
        <Nav />
        <main className="mx-auto min-h-[70vh] w-full max-w-5xl px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
