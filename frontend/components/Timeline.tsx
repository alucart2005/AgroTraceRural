import type { Evento } from "@/lib/types";
import { EVENTO_LABELS } from "@/lib/types";

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function Timeline({ eventos }: { eventos: Evento[] }) {
  if (eventos.length === 0) {
    return <p className="text-sm text-emerald-900/60">Sin eventos registrados.</p>;
  }
  const ordenados = [...eventos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return (
    <ol className="relative ml-3 border-l-2 border-emerald-200 pl-6">
      {ordenados.map((e, i) => (
        <li key={e.id} className="relative mb-6 last:mb-0">
          <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
            {i + 1}
          </span>
          <p className="text-sm font-bold text-emerald-900">
            {EVENTO_LABELS[e.tipo] ?? e.tipo}
          </p>
          <p className="text-xs text-emerald-900/60">{fmt(e.fecha)}</p>
          <p className="mt-1 text-sm text-emerald-900/80">{e.descripcion}</p>
        </li>
      ))}
    </ol>
  );
}
