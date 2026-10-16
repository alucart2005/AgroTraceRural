"""Paridad de hash frontend ⇄ backend y reglas del payload canónico.

Los vectores CON_FOTOS / SIN_FOTOS fueron calculados con el código REAL del
navegador (``frontend/lib/hash.ts`` → ``payloadDeLote`` + ``hashLote`` en Node).
Si este test falla, la verificación HU-03 se rompería en producción.
"""

from app.services.sha256 import CAMPOS_LOTE, hash_canonico, hash_lote, payload_lote

VECTOR_CON_FOTOS = (
    "3fdade2cee495afaeb8648415a7bd453d82650f427e2a43eedeafd07abd7a4b2"
)
VECTOR_SIN_FOTOS = (
    "e7214a9b8af68bf9c571a13f41919552980c9e060c0aad6725d3a05d42d8a1e8"
)

LOTE_CON_FOTOS = {
    "codigo": "HUE-2027-001",
    "fecha_cosecha": "2027-03-14",
    "fecha_postura": "2027-03-13",  # NO entra al hash (decisión de producto)
    "linea_productiva": "Huevos Guarumo",
    "cantidad": 10,
    "unidad": "cubetas",
    "finca": "Finca Guarumo",
    "municipio": "Cáceres, Antioquia",
    "evidencias": [
        {"nombre": "galpon-huevos.jpg", "tamano": 2481930},
        {"nombre": "cubetas-empaque.jpg", "tamano": 512000},
    ],
    "stellar_tx_hash": "abc",  # tampoco entra
}

LOTE_SIN_FOTOS = {
    "codigo": "HUE-2027-002",
    "fecha_cosecha": "2027-03-15",
    "linea_productiva": "Huevos Guarumo",
    "cantidad": 5,
    "unidad": "cubetas",
    "finca": "Finca Guarumo",
    "municipio": "Cáceres, Antioquia",
    "evidencias": [],
}


# --- canónico ---------------------------------------------------------------

def test_hash_determinista():
    assert hash_canonico({"a": 1}) == hash_canonico({"a": 1})


def test_hash_independiente_del_orden():
    assert hash_canonico({"a": 1, "b": 2}) == hash_canonico({"b": 2, "a": 1})


def test_hash_sensible_a_cambios():
    assert hash_canonico({"a": 1}) != hash_canonico({"a": 2})


# --- payload canónico -------------------------------------------------------

def test_payload_solo_incluye_los_ocho_campos():
    payload = payload_lote(LOTE_CON_FOTOS)
    assert set(payload) == set(CAMPOS_LOTE)
    assert "fecha_postura" not in payload
    assert "stellar_tx_hash" not in payload


def test_payload_normaliza_evidencias_a_nombre_y_tamano():
    payload = payload_lote(
        {
            **LOTE_CON_FOTOS,
            "evidencias": [
                {"nombre": "a.jpg", "tamano": 10, "url": "https://cdn.example/x"}
            ],
        }
    )
    assert payload["evidencias"] == [{"nombre": "a.jpg", "tamano": 10}]


def test_payload_con_evidencias_vacias():
    assert payload_lote(LOTE_SIN_FOTOS)["evidencias"] == []


# --- paridad con el navegador (vectores reales de hash.ts) ------------------

def test_hash_con_fotos_coincide_con_el_navegador():
    assert hash_lote(LOTE_CON_FOTOS) == VECTOR_CON_FOTOS


def test_hash_sin_fotos_coincide_con_el_navegador():
    assert hash_lote(LOTE_SIN_FOTOS) == VECTOR_SIN_FOTOS


def test_hash_lote_sensible_a_las_fotos():
    otro = {**LOTE_CON_FOTOS, "evidencias": [{"nombre": "x.jpg", "tamano": 1}]}
    assert hash_lote(LOTE_CON_FOTOS) != hash_lote(otro)


def test_hash_lote_sensible_a_la_cantidad():
    assert hash_lote(LOTE_CON_FOTOS) != hash_lote({**LOTE_CON_FOTOS, "cantidad": 11})
