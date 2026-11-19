"""Pruebas de la moderación suave: lotes ocultos.

Un lote oculto se comporta como inexistente para el frontend (listados, ficha,
verificación y escrituras) sin borrarse ni alterar su hash anclado.
"""

from __future__ import annotations

from sqlalchemy import select

from app.models.lote import Lote
from tests.conftest import payload_lote

EVENTO = {
    "tipo": "empaque",
    "fecha": "2027-03-14T09:00:00-05:00",
    "descripcion": "10 cubetas en caja con etiqueta QR.",
}


def _crear(client, **kwargs) -> dict:
    res = client.post("/api/lotes", json=payload_lote(), **kwargs)
    assert res.status_code == 201, res.text
    return res.json()


def _ocultar(db_session, codigo: str) -> Lote:
    lote = db_session.scalar(select(Lote).where(Lote.codigo == codigo))
    lote.oculto = True
    db_session.commit()
    db_session.refresh(lote)
    return lote


def test_lote_oculto_desaparece_de_los_listados(client, db_session):
    visible = _crear(client)["codigo"]
    oculto = _crear(client)["codigo"]
    _ocultar(db_session, oculto)

    publico = client.get("/api/lotes")
    assert publico.status_code == 200
    codigos = [l["codigo"] for l in publico.json()]
    assert codigos == [visible]
    assert publico.headers["x-total-count"] == "1"

    mios = client.get("/api/lotes/mios")
    assert [l["codigo"] for l in mios.json()] == [visible]
    assert mios.headers["x-total-count"] == "1"


def test_lote_oculto_responde_404_en_ficha_verificacion_y_eventos(
    client, db_session
):
    codigo = _crear(client)["codigo"]
    _ocultar(db_session, codigo)

    assert client.get(f"/api/lotes/{codigo}").status_code == 404
    assert client.get(f"/api/lotes/{codigo}/eventos").status_code == 404
    assert client.get(f"/api/verify/{codigo}").status_code == 404
    assert (
        client.post(f"/api/lotes/{codigo}/eventos", json=EVENTO).status_code
        == 404
    )
    assert client.post(f"/api/lotes/{codigo}/anclar").status_code == 404


def test_ocultar_no_altera_el_hash_ni_la_verificacion(client, db_session):
    creado = _crear(client)
    codigo = creado["codigo"]
    lote = _ocultar(db_session, codigo)

    # El hash canónico no incluye ``oculto``: sigue siendo el mismo.
    assert lote.hash_sha256 == creado["hash_sha256"]

    # Al volver a mostrarlo, la verificación sigue en verde.
    lote.oculto = False
    db_session.commit()
    verificacion = client.get(f"/api/verify/{codigo}").json()
    assert verificacion["verificado"] is True
    assert verificacion["cadena_valida"] is True
