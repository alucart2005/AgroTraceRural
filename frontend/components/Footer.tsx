export default function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-emerald-900/10 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-emerald-900/60 sm:flex-row sm:items-center sm:justify-between">
        <p>🌱 AgroTrace Rural — Finca Guarumo, Cáceres (Antioquia), Colombia.</p>
        <p>
          Trazabilidad con{" "}
          <span className="font-semibold text-emerald-800">SHA-256 + Stellar Testnet</span>
        </p>
      </div>
    </footer>
  );
}
