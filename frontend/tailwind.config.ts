import type { Config } from "tailwindcss";

/**
 * Paleta de marca: un solo verde ("tinta de hoja") sobre papel frío.
 * Se sobreescribe la escala `emerald` para que todo el código existente
 * herede los tonos de AgroTrace sin tener que renombrar clases.
 */
const verde = {
  50: "#F1F6F1",
  100: "#E1EDE3",
  200: "#C6DCCB",
  300: "#9FC5AA",
  400: "#6DA47E",
  500: "#46875B",
  600: "#2F6D44",
  700: "#235A37",
  800: "#1B4729",
  900: "#14351F",
  950: "#0B2114",
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: verde,
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
