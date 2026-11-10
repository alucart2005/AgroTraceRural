import type { ContenidoAbout } from "./tipos";

/** About AgroTrace — English. */
export const about: ContenidoAbout = {
  titulo: "About AgroTrace Rural",
  bajada:
    "A direct channel between the farm and the buyer, with verifiable traceability on every crate.",
  bloques: [
    {
      id: "proyecto",
      titulo: "What AgroTrace Rural is",
      parrafos: [
        "AgroTrace Rural is an agrifood traceability project aiming to build a farm → buyer channel: to reduce the dependence on middlemen and let consumers verify the origin of what they buy through a QR code.",
        "At the heart of the project is a platform of digital records with SHA-256 cryptographic fingerprints and selective anchoring of events on the Stellar network. Documents, photographs and videos are never stored on the blockchain: they live in digital storage and only their cryptographic fingerprint, date, batch and reference are recorded, so that any later change to the file can be detected.",
      ],
    },
    {
      id: "piloto",
      titulo: "The pilot",
      tabla: {
        columnas: ["Aspect", "Detail"],
        filas: [
          ["Location", "Guarumo, Cáceres — Bajo Cauca, Antioquia (Colombia)"],
          ["Area", "6 hectares"],
          [
            "Production",
            "Fish · laying hens · ducks · pigs · cattle · fruit trees",
          ],
          ["Pilot product", "Crate of eggs with a digital QR passport"],
          ["Preliminary investment", "$48,000,000 COP"],
          ["Horizon", "36 months, with a first stage of 12 months"],
        ],
      },
    },
    {
      id: "sello",
      titulo: "How a batch is sealed",
      parrafos: [
        "For every batch a SHA-256 fingerprint is computed over eight fields: code, harvest date, production line, quantity, unit, farm, municipality and evidence. That 32-byte fingerprint travels to Stellar Testnet inside the memo of a 1 XLM payment; everything else stays off the network.",
      ],
      lista: [
        "The buyer recomputes the fingerprint from the public page and compares it with the anchor.",
        "If a value or a photo changes after anchoring, the comparison fails and the page says so.",
        "Photographic evidence is kept in external storage; only its size and name travel in the hash.",
      ],
    },
    {
      id: "infraestructura",
      titulo: "Real infrastructure",
      lista: [
        "Frontend on Vercel with Next.js 14.",
        "Backend in FastAPI on Docker, deployed on Render.",
        "Database on Neon Postgres.",
        "Photographic evidence on Cloudflare R2 (S3 compatible).",
        "Anchoring on Stellar Testnet, where only the SHA-256 hash travels as a Memo Hash.",
        "For local development: SQLite and browser demo mode.",
      ],
    },
  ],
};
