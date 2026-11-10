/** Iconos SVG inline (estilo línea, 24×24) para el shell del productor y la
 * ficha del lote. Sin dependencias: mismos trazos que la hamburguesa de Nav. */

interface Props {
  className?: string;
}

function base(className?: string) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

export function IconoInicio({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

export function IconoLotes({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
      <path d="M4 12.5 12 17l8-4.5" />
      <path d="M4 16.5 12 21l8-4.5" />
    </svg>
  );
}

export function IconoProductos({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M12 2 9.5 9.5H2l6 4.5-2.5 8L12 17l6.5 5L16 14l6-4.5h-7.5L12 2Z" />
    </svg>
  );
}

export function IconoEvidencias({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="4" />
    </svg>
  );
}

export function IconoConfiguracion({ className }: Props) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v3M12 18.5v3M4.6 7l2.6 1.5M16.8 15.5 19.4 17M4.6 17l2.6-1.5M16.8 8.5 19.4 7" />
    </svg>
  );
}

export function IconoCheckCircle({ className }: Props) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5.5" />
    </svg>
  );
}

export function IconoCheck({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconoUbicacion({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconoCalendario({ className }: Props) {
  return (
    <svg {...base(className)}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 2.5V6M16 2.5V6" />
    </svg>
  );
}

export function IconoCantidad({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M3.5 8.5h17v11h-17v-11Z" />
      <path d="M7 8.5v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      <path d="M3.5 13h17" />
    </svg>
  );
}

export function IconoInfo({ className }: Props) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M12 11.5V16" />
    </svg>
  );
}

export function IconoFlechaDerecha({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M4 12h15M13.5 5.5 20 12l-6.5 6.5" />
    </svg>
  );
}

export function IconoFlechaIzquierda({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M20 12H5M10.5 5.5 4 12l6.5 6.5" />
    </svg>
  );
}

export function IconoCamara({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="4" />
    </svg>
  );
}

export function IconoProductor({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

export function IconoDescripcion({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M5 4.5h14v15H5z" />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" />
    </svg>
  );
}

export function IconoBuscar({ className }: Props) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function IconoQr({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2.5v2.5H14zM18 18h2v2h-2zM14 20h2M20 14h.01" />
    </svg>
  );
}

export function IconoNuevoLote({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M12 5v14M5 12h14" />
      <path d="M4.5 4.5h15v15h-15z" opacity="0.25" />
    </svg>
  );
}

export function IconoHistorial({ className }: Props) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconoUsuario({ className }: Props) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </svg>
  );
}

export function IconoCapas({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </svg>
  );
}

export function IconoChevron({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function IconoAyuda({ className }: Props) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.8-.9 1.4v.4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconoVersiones({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M4 6.5h9M4 12h9M4 17.5h6" />
      <path d="M17 5v9.5M17 14.5l-2 2 2 2" />
      <path d="M15 17.5h6" opacity="0.35" />
    </svg>
  );
}

export function IconoSoporte({ className }: Props) {
  return (
    <svg {...base(className)}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 13h2.5a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 6.5 18H5a1 1 0 0 1-1-1Z" />
      <path d="M20 13h-2.5a1.5 1.5 0 0 0-1.5 1.5v2a1.5 1.5 0 0 0 1.5 1.5H19a1 1 0 0 0 1-1Z" />
    </svg>
  );
}
