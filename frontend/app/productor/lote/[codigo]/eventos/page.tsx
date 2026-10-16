import EventosLotePage from "@/components/EventosLote";

export default function Page({ params }: { params: { codigo: string } }) {
  return <EventosLotePage codigo={decodeURIComponent(params.codigo)} />;
}
