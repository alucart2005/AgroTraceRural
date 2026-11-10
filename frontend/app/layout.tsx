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

/**
 * Se aplica el tema ANTES del primer pintado: sin este script la página
 * aparecería un instante en claro y luego saltaría a oscuro (flash).
 */
const SCRIPT_TEMA = `(function(){try{var g=localStorage.getItem('agrotrace.tema');var t=(g==='claro'||g==='oscuro')?g:(window.matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro');if(t==='oscuro'){document.documentElement.classList.add('dark');}document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
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
