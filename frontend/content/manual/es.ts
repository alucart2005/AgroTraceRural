import type { Manual } from "./tipos";

/** Manual de usuario — Español (documento base). */
export const manual: Manual = {
  titulo: "Manual de usuario",
  bajada:
    "Todo lo que necesitas para registrar un lote, seguir su cadena de custodia y verificar su integridad desde el celular o el computador.",
  secciones: [
    {
      id: "que-es",
      titulo: "Qué es AgroTrace y cómo funciona",
      parrafos: [
        "AgroTrace Rural abre un canal directo entre la finca y el consumidor. Cada cosecha registrada recibe un código único (por ejemplo HUE-2026-008), su propia página pública y una etiqueta QR para pegar en la cubeta. Quien compra escanea el código y ve el origen, la fecha, las fotos y la línea de tiempo del lote.",
        "El principio es sencillo: los archivos pesados nunca van a la blockchain. Las fotos se guardan en almacenamiento externo y en Stellar solo viaja la huella SHA-256 de 32 bytes, dentro del memo de un pago de 1 XLM.",
      ],
      tabla: {
        columnas: ["Dato que entra en la huella", "Ejemplo"],
        filas: [
          ["Código del lote", "HUE-2026-008"],
          ["Fecha de cosecha", "2026-10-25"],
          ["Línea productiva", "Huevos Guarumo"],
          ["Cantidad y unidad", "35 cubetas"],
          ["Finca y municipio", "Finca Guarumo · Cáceres, Antioquia"],
          ["Evidencias (nombre y tamaño)", "ATR-1.jpg · 74776 bytes"],
        ],
      },
      aviso: {
        tono: "nota",
        titulo: "Si alguien altera una foto o un dato",
        texto:
          "La huella recalculada deja de coincidir con la anclada y la ficha lo dice. El registro original queda intacto en la red.",
      },
    },
    {
      id: "consultar",
      titulo: "Consultar un lote (para el comprador)",
      pasos: [
        {
          titulo: "Escanea el QR",
          texto:
            "Usa la cámara del celular sobre la etiqueta de la cubeta. Se abre la página pública del lote.",
        },
        {
          titulo: "Revisa la ficha",
          texto:
            "Verás el sello de verificación, el código del lote, la línea productiva, las fotos en carrusel y los datos: productor, ubicación, fecha, cantidad y estado.",
        },
        {
          titulo: "Verifica la integridad",
          texto:
            "Pulsa el ícono de información junto a «Estado» para ver el hash registrado, el hash recalculado y la transacción en Stellar.",
        },
      ],
      aviso: {
        tono: "info",
        titulo: "Si el código no existe",
        texto:
          "La página indica «Lote no encontrado» y no muestra datos guardados en tu navegador: un QR falso no puede pasar por auténtico.",
      },
    },
    {
      id: "registrar",
      titulo: "Registrar un lote (para el productor)",
      parrafos: [
        "Necesitas iniciar sesión con tu cuenta de Google y, la primera vez, completar tu perfil (cédula, teléfono, finca y municipio). Después, el registro se hace en tres pasos.",
      ],
      pasos: [
        {
          titulo: "Datos del lote",
          texto:
            "Producto, fecha de producción, cantidad con su unidad y, si la quieres, la fecha de postura.",
        },
        {
          titulo: "Evidencias",
          texto:
            "Adjunta al menos una foto: es obligatoria. Puedes subir hasta seis, y se comprimen a 800 px para que el registro siga siendo ligero.",
        },
        {
          titulo: "Resumen",
          texto:
            "Revisa todo y guarda. Se genera el código HUE-YYYY-NNN, se calcula la huella y se ancla en Stellar.",
        },
      ],
      aviso: {
        tono: "nota",
        titulo: "Si la red falla al anclar",
        texto:
          "El lote queda guardado y el anclaje se puede reintentar más tarde. Nunca se crea un lote fantasma ni se pierden fotos.",
      },
    },
    {
      id: "custodia",
      titulo: "Cadena de custodia",
      parrafos: [
        "Con el lote registrado, puedes anotar los pasos de la mercadería: clasificación, empaque y despacho, cada uno con fecha, hora y descripción. El comprador los ve en la línea de tiempo de la ficha pública.",
      ],
      aviso: {
        tono: "nota",
        titulo: "Los eventos no son parte de la huella",
        texto:
          "Se registran después de anclar el lote y describen lo que pasó con la mercadería, no los datos que quedaron sellados.",
      },
    },
    {
      id: "verificar",
      titulo: "Verificar la integridad",
      lista: [
        "Lote verificado: la huella recalculada coincide con la anclada en Stellar Testnet.",
        "Lote no verificado: la huella no coincide con el ancla.",
        "Verificación no disponible: no se pudo consultar el backend o la red de Stellar.",
      ],
      parrafos: [
        "Desde el detalle puedes abrir la transacción en el explorador de Horizon y leer el memo, donde está la huella en hexadecimal. La red usada es Stellar Testnet, la de pruebas.",
      ],
    },
    {
      id: "etiqueta",
      titulo: "Etiquetas QR",
      pasos: [
        {
          titulo: "Abre la etiqueta",
          texto: "Desde la ficha del lote, en el botón «Ver etiqueta QR».",
        },
        {
          titulo: "Imprime",
          texto: "Desde el navegador o guardando la imagen.",
        },
        {
          titulo: "Pega una por cubeta",
          texto:
            "Cada etiqueta lleva su código, la finca, la cantidad y la fecha de empaque.",
        },
      ],
      parrafos: [
        "El código se dimensiona entre 150 y 300 px según el espacio disponible, siempre centrado y con una zona de silencio que permite leerlo sin problemas. La etiqueta se imprime siempre en tema claro, aunque la aplicación esté en oscuro.",
      ],
    },
    {
      id: "ayuda",
      titulo: "Ayuda y límites",
      lista: [
        "AgroTrace demuestra que el registro no fue alterado; no certifica la calidad del producto ni reemplaza el registro sanitario oficial.",
        "El anclaje se hace en Stellar Testnet, la red de pruebas.",
        "Las fotos viven en almacenamiento externo, no en la blockchain.",
      ],
      parrafos: [
        "Si el backend no responde, la aplicación sigue funcionando con los datos guardados en tu navegador y lo anuncia en pantalla. Ese es el modo demo: sirve para explorar, no para registrar información real.",
        "Para reportar un problema o pedir ayuda, usa la página «Reportar un problema».",
      ],
    },
  ],
};
