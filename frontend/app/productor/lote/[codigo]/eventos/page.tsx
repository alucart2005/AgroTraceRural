import EventosLotePage from "@/components/EventosLote";
import ProtegerProductor from "@/components/ProtegerProductor";

export default function Page({ params }: { params: { codigo: string } }) {
  const codigo = decodeURIComponent(params.codigo);
  // HU-06: la zona del productor exige sesión; el consumidor consulta en /lote/[id].
  return (
    <ProtegerProductor>
      <EventosLotePage codigo={codigo} />
    </ProtegerProductor>
  );
}
