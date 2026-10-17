"""Demostración end-to-end: hash → ancla en Stellar Testnet → verificación.

Sirve de prueba de humo del flujo completo sin pasar por la API:

    STELLAR_SECRET_KEY=... python -m scripts.anchor_demo

Crea UNA transacción real en Testnet (memoriza 32 bytes con el SHA-256) y luego
la consulta de vuelta a Horizon para comprobar que el memo coincide.
"""

from app.services.sha256 import hash_lote
from app.services.stellar import StellarError, anchor_hash, verify_anchor


def main():
    datos = {
        "codigo": "HUE-2027-001",
        "fecha_cosecha": "2027-03-14",
        # Decisión de producto: ``fecha_postura`` queda FUERA del hash.
        "fecha_postura": "2027-03-13",
        "linea_productiva": "Huevos Guarumo",
        "cantidad": 10,
        "unidad": "cubetas",
        "finca": "Finca Guarumo",
        "municipio": "Cáceres, Antioquia",
        # Solo entran nombre y tamaño: las URLs de R2 pueden cambiar y
        # romperían la verificación.
        "evidencias": [
            {"nombre": "galpon-huevos.jpg", "tamano": 2481930},
            {"nombre": "cubetas-empaque.jpg", "tamano": 512000},
        ],
    }

    # ``hash_lote`` recibe UN dict e ignora los campos que no forman parte del
    # payload canónico (fecha_postura, hashes, urls...).
    h = hash_lote(datos)
    print(f"Lote    : {datos['codigo']}")
    print(f"SHA-256 : {h}")

    try:
        result = anchor_hash(datos["codigo"], h)
    except StellarError as exc:
        print(f"Error al anclar: {exc}")
        return 1

    tx = result["tx_hash"]
    print(f"Anclado : tx={tx} ledger={result['ledger']}")

    try:
        v = verify_anchor(tx, h)
    except StellarError as exc:
        print(f"Error al verificar: {exc}")
        return 1

    if v["verified"]:
        print(f"Verificación on-chain: VERIFICADO (ledger {v['ledger']})")
        return 0

    print(f"Verificación on-chain: NO VERIFICADO → {v}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
