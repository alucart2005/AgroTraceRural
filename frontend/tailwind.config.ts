import type { Config } from "tailwindcss";

/**
 * Paleta de marca: un solo verde ("tinta de hoja") sobre papel frío.
 *
 * Los valores viven en variables CSS (ver app/globals.css): la escala se
 * declara como trípletes RGB para que los modificadores de opacidad
 * (`bg-emerald-50/70`) sigan funcionando, y `.dark` en <html> repinta todo
 * el proyecto sin duplicar clases `dark:` en cada componente.
 */
const verde = {
  50: "rgb(var(--e-50) / <alpha-value>)",
  100: "rgb(var(--e-100) / <alpha-value>)",
  200: "rgb(var(--e-200) / <alpha-value>)",
  300: "rgb(var(--e-300) / <alpha-value>)",
  400: "rgb(var(--e-400) / <alpha-value>)",
  500: "rgb(var(--e-500) / <alpha-value>)",
  600: "rgb(var(--e-600) / <alpha-value>)",
  700: "rgb(var(--e-700) / <alpha-value>)",
  800: "rgb(var(--e-800) / <alpha-value>)",
  900: "rgb(var(--e-900) / <alpha-value>)",
  950: "rgb(var(--e-950) / <alpha-value>)",
};

/* Avisos y alertas: también se tematizan, para que los estados (ámbar y rojo)
   se adapten sin tocar el markup de cada pantalla. */
const ambar = {
  50: "rgb(var(--a-50) / <alpha-value>)",
  100: "rgb(var(--a-100) / <alpha-value>)",
  200: "rgb(var(--a-200) / <alpha-value>)",
  300: "rgb(var(--a-300) / <alpha-value>)",
  400: "rgb(var(--a-400) / <alpha-value>)",
  500: "rgb(var(--a-500) / <alpha-value>)",
  600: "rgb(var(--a-600) / <alpha-value>)",
  700: "rgb(var(--a-700) / <alpha-value>)",
  800: "rgb(var(--a-800) / <alpha-value>)",
  900: "rgb(var(--a-900) / <alpha-value>)",
};

const rojo = {
  50: "rgb(var(--r-50) / <alpha-value>)",
  100: "rgb(var(--r-100) / <alpha-value>)",
  200: "rgb(var(--r-200) / <alpha-value>)",
  300: "rgb(var(--r-300) / <alpha-value>)",
  400: "rgb(var(--r-400) / <alpha-value>)",
  500: "rgb(var(--r-500) / <alpha-value>)",
  600: "rgb(var(--r-600) / <alpha-value>)",
  700: "rgb(var(--r-700) / <alpha-value>)",
  800: "rgb(var(--r-800) / <alpha-value>)",
  900: "rgb(var(--r-900) / <alpha-value>)",
};

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: verde,
        amber: ambar,
        red: rojo,
        /** Superficie elevada (tarjetas, paneles) */
        superficie: "rgb(var(--superficie) / <alpha-value>)",
        /** Filetes y divisores */
        regla: "rgb(var(--regla) / <alpha-value>)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-ui)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
