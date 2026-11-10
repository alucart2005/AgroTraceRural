import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-10 text-center">
      <div className="flex justify-center">
        <Logo tamano="lg" />
      </div>
      <div className="card">
        <p className="font-display text-5xl font-semibold text-emerald-300">404</p>
        <h1 className="mt-2 font-display text-[26px] font-semibold tracking-tight text-emerald-950">
          Esta página no existe
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900/70">
          El enlace que seguiste no lleva a ninguna parte. Si venías a consultar
          un lote, revisa el código del QR.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn-primary">
            Ir al inicio
          </Link>
          <Link href="/#buscar" className="btn-secondary">
            Consultar un lote
          </Link>
        </div>
      </div>
    </div>
  );
}
