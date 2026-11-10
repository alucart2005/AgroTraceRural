/** Logo AgroTrace Rural: hoja en dos tonos de verde + wordmark. La marca se
 * apoya en la tipografía display (Fraunces) para el nombre y la grotesca
 * (Archivo) para el descriptor. */

export default function Logo({
  className = "",
  tamano = "md",
}: {
  className?: string;
  /** md ≈ header, lg ≈ sidebar y piezas de marca */
  tamano?: "md" | "lg";
}) {
  const hoja = tamano === "lg" ? "h-10 w-10" : "h-8 w-8";
  const titulo = tamano === "lg" ? "text-[22px]" : "text-[17px]";
  const descriptor = tamano === "lg" ? "text-[11px]" : "text-[10px]";
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className={`${hoja} shrink-0`} aria-hidden>
        {/* Los tonos de la hoja usan los tokens de marca: seadaptan al tema
            oscuro sin alterar el verde original del tema claro. */}
        <path
          d="M21 41C10 34 8 20 16 7c10 4 14 15 11 25-1 4-3 7-6 9Z"
          fill="rgb(var(--marca))"
        />
        <path
          d="M24 41c-1-9 3-19 12-23 3 9-1 18-9 22l-3 1Z"
          fill="rgb(var(--e-400))"
        />
        <path
          d="M22 42c1-8 5-16 11-21"
          stroke="rgb(var(--e-950))"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span className="leading-none">
        <span
          className={`block font-display font-semibold tracking-tight text-emerald-950 ${titulo}`}
        >
          AgroTrace
        </span>
        <span
          className={`block font-sans font-medium uppercase tracking-[0.18em] text-emerald-800/80 ${descriptor}`}
        >
          Rural
        </span>
      </span>
    </span>
  );
}
