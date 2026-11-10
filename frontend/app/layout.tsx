import type { Metadata } from "next";
import localFont from "next/font/local";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

// Fraunces: serif variable con eje óptico, para titulares y cifras grandes.
// Archivo: grotesca variable para interfaz, etiquetas y datos.
const fraunces = localFont({
  src: "./fonts/FrauncesVF.woff2",
  variable: "--font-display",
  weight: "400 700",
  display: "swap",
});

const archivo = localFont({
  src: "./fonts/ArchivoVF.woff2",
  variable: "--font-ui",
  weight: "400 700",
  display: "swap",
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
      <body
        className={`${fraunces.variable} ${archivo.variable} font-sans antialiased`}
      >
        <Nav />
        <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
