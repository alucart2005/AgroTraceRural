import type { Manual } from "./tipos";

/** User manual — English. */
export const manual: Manual = {
  titulo: "User manual",
  bajada:
    "Everything you need to register a batch, follow its chain of custody and verify its integrity from a phone or a computer.",
  secciones: [
    {
      id: "que-es",
      titulo: "What AgroTrace is and how it works",
      parrafos: [
        "AgroTrace Rural opens a direct channel between the farm and the buyer. Every registered harvest gets a unique code (for example HUE-2026-008), its own public page and a QR label to stick on the crate. Buyers scan the code and see the origin, the date, the photos and the timeline of the batch.",
        "The principle is simple: heavy files never go on the blockchain. The photos live in external storage and only the 32-byte SHA-256 fingerprint travels to Stellar, inside the memo of a 1 XLM payment.",
      ],
      tabla: {
        columnas: ["Data included in the fingerprint", "Example"],
        filas: [
          ["Batch code", "HUE-2026-008"],
          ["Harvest date", "2026-10-25"],
          ["Production line", "Guarumo Eggs"],
          ["Quantity and unit", "35 crates"],
          ["Farm and municipality", "Finca Guarumo · Cáceres, Antioquia"],
          ["Evidence (name and size)", "ATR-1.jpg · 74776 bytes"],
        ],
      },
      aviso: {
        tono: "nota",
        titulo: "If someone changes a photo or a value",
        texto:
          "The recalculated fingerprint stops matching the anchored one and the page says so. The original record stays intact on the network.",
      },
    },
    {
      id: "consultar",
      titulo: "Looking up a batch (for the buyer)",
      pasos: [
        {
          titulo: "Scan the QR",
          texto:
            "Point your phone camera at the label on the crate. The public page of the batch opens.",
        },
        {
          titulo: "Read the page",
          texto:
            "You will see the verification seal, the batch code, the production line, the photos in a carousel and the details: producer, location, date, quantity and status.",
        },
        {
          titulo: "Verify the integrity",
          texto:
            "Tap the information icon next to “Status” to see the recorded hash, the hash recalculated now and the transaction on Stellar.",
        },
      ],
      aviso: {
        tono: "info",
        titulo: "If the code does not exist",
        texto:
          "The page says “Batch not found” and shows no data stored in your browser: a fake QR cannot pass as authentic.",
      },
    },
    {
      id: "registrar",
      titulo: "Registering a batch (for the producer)",
      parrafos: [
        "You need to sign in with your Google account and, the first time, complete your profile (ID number, phone, farm and municipality). After that, registration takes three steps.",
      ],
      pasos: [
        {
          titulo: "Batch details",
          texto:
            "Product, production date, quantity with its unit and, if you want, the laying date.",
        },
        {
          titulo: "Evidence",
          texto:
            "Attach at least one photo: it is mandatory. You can upload up to six, and they are compressed to 800 px so the record stays light.",
        },
        {
          titulo: "Summary",
          texto:
            "Review everything and save. The HUE-YYYY-NNN code is generated, the fingerprint is computed and anchored on Stellar.",
        },
      ],
      aviso: {
        tono: "nota",
        titulo: "If the network fails while anchoring",
        texto:
          "The batch stays saved and the anchoring can be retried later. No ghost batch is ever created and no photo is lost.",
      },
    },
    {
      id: "custodia",
      titulo: "Chain of custody",
      parrafos: [
        "Once the batch is registered you can record how the goods moved: sorting, packing and dispatch, each with a date, a time and a description. Buyers see them in the timeline of the public page.",
      ],
      aviso: {
        tono: "nota",
        titulo: "Events are not part of the fingerprint",
        texto:
          "They are recorded after the batch is anchored and describe what happened to the goods, not the data that was sealed.",
      },
    },
    {
      id: "verificar",
      titulo: "Verifying integrity",
      lista: [
        "Batch verified: the recalculated fingerprint matches the one anchored on Stellar Testnet.",
        "Batch not verified: the fingerprint does not match the anchor.",
        "Verification unavailable: neither the backend nor the Stellar network could be reached.",
      ],
      parrafos: [
        "From the detail panel you can open the transaction in the Horizon explorer and read the memo, where the fingerprint sits in hexadecimal. The network in use is Stellar Testnet, the test one.",
      ],
    },
    {
      id: "etiqueta",
      titulo: "QR labels",
      pasos: [
        {
          titulo: "Open the label",
          texto: "From the batch page, using the “View QR label” button.",
        },
        {
          titulo: "Print it",
          texto: "From the browser, or by saving the image.",
        },
        {
          titulo: "Stick one on each crate",
          texto:
            "Each label carries its code, the farm, the quantity and the packing date.",
        },
      ],
      parrafos: [
        "The code is sized between 150 and 300 px depending on the space available, always centred and with a quiet zone that makes it easy to scan. The label always prints in the light theme, even when the app is in dark mode.",
      ],
    },
    {
      id: "ayuda",
      titulo: "Help and limits",
      lista: [
        "AgroTrace proves that the record was not altered; it does not certify product quality nor replace the official sanitary register.",
        "Anchoring happens on Stellar Testnet, the test network.",
        "Photos live in external storage, not on the blockchain.",
      ],
      parrafos: [
        "If the backend is unreachable the app keeps working with the data stored in your browser and says so on screen. That is the demo mode: it is there to explore, not to record real information.",
        "To report a problem or ask for help, use the “Report a problem” page.",
      ],
    },
  ],
};
