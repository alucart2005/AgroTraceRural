import type { ReactNode } from "react";
import SidebarProductor from "@/components/SidebarProductor";

/**
 * Shell del área del productor (mockup desktop): sidebar a la izquierda con el
 * logo y la navegación, contenido a la derecha. En móvil no se renderiza el
 * sidebar (hidden md:..) y el nav sigue siendo el header con hamburguesa.
 *
 * La clase ``shell-productor`` permite que ``globals.css`` libere el ancho del
 * ``<main>`` raíz solo en estas rutas, sin afectar el resto de la app.
 */
export default function ProductorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell-productor mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:py-8">
      <SidebarProductor />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
