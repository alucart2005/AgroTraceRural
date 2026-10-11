import Link from "next/link";

const pasos = [
  {
    n: "1",
    titulo: "Registro del lote",
    texto: "El productor ingresa fecha, línea productiva y cantidad, y adjunta una foto de evidencia.",
    href: "/productor/nuevo",
    hu: "HU-01",
  },
  {
    n: "2",
    titulo: "Hash + ancla en Stellar",
    texto: "El sistema calcula el SHA-256 de los datos y ancla la huella en Stellar Testnet (solo el hash).",
    href: "/lote/HUE-2027-001",
    hu: "HU-03",
  },
  {
    n: "3",
    titulo: "Etiqueta QR imprimible",
    texto: "Se genera un QR único por cubeta que enlaza a la página pública del lote.",
    href: "/lote/HUE-2027-001/etiqueta",
    hu: "HU-04",
  },
  {
    n: "4",
    titulo: "Consulta del consumidor",
    texto: "El cliente escanea el QR y ve origen, fecha, fotos y la línea de tiempo del lote.",
    href: "/lote/HUE-2027-001",
    hu: "HU-02 / HU-05",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-6 pt-6 text-center">
        <span className="badge bg-emerald-100 text-emerald-800">
          🇨🇴 Finca Guarumo · Cáceres, Antioquia
        </span>
        <h1 className="mx-auto max-w-2xl text-4xl font-black leading-tight text-emerald-950 sm:text-5xl">
          Del campo al cliente, con trazabilidad verificable
        </h1>
        <p className="mx-auto max-w-xl text-lg text-emerald-900/70">
          Pasaporte digital para cada cubeta de huevos: fotos de evidencia fuera
          de la blockchain, huella <strong>SHA-256</strong> anclada en{" "}
          <strong>Stellar Testnet</strong> y un código QR para verificarlo en el
          punto de venta.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/productor/nuevo" className="btn-primary">
            🥚 Registrar lote
          </Link>
          <Link href="/lote/HUE-2027-001" className="btn-secondary">
            🔍 Ver lote demo (QR)
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-emerald-900/60">
          <span className="badge bg-white ring-1 ring-emerald-900/10">Next.js en Vercel</span>
          <span className="badge bg-white ring-1 ring-emerald-900/10">FastAPI (backend)</span>
          <span className="badge bg-white ring-1 ring-emerald-900/10">SHA-256</span>
          <span className="badge bg-white ring-1 ring-emerald-900/10">Stellar Testnet</span>
          <span className="badge bg-white ring-1 ring-emerald-900/10">QR por cubeta</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-emerald-950">Flujo de trazabilidad</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pasos.map((p) => (
            <Link key={p.n} href={p.href} className="card group transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">
                  {p.n}
                </span>
                <div>
                  <p className="font-bold text-emerald-950 group-hover:underline">
                    {p.titulo}
                  </p>
                  <p className="text-xs font-semibold text-emerald-700">{p.hu}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-emerald-900/70">{p.texto}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold text-emerald-950">¿Por qué la blockchain aquí?</h2>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900/75">
          Los archivos pesados (fotos) nunca van a la blockchain: se guardan en
          almacenamiento externo. En Stellar <em>solo</em> viaja la huella
          SHA-256 de 32 bytes dentro del <em>memo</em> de una transacción. Así
          productor, consumidor y autoridad sanitaria pueden auditar de forma
          independiente que los registros no fueron alterados — con costos casi
          nulos y confirmación en 3–5 segundos.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/lote/HUE-2027-001" className="font-semibold text-emerald-700 underline">
            Probar la verificación de integridad →
          </Link>
        </p>
      </section>
    </div>
  );
}
