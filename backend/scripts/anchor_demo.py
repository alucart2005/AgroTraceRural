"""End-to-end demo: hash → anchor on Stellar Testnet → verify."""

from app.services.sha256 import hash_lote
from app.services.stellar import StellarError, anchor_hash, verify_anchor


def main():
    datos = {
        "codigo": "HUE-2027-001",
        "fecha_cosecha": "2027-03-14",
        "linea_productiva": "Huevos Guarumo",
        "cantidad": 10,
        "unidad": "cubetas",
        "finca": "Finca Guarumo",
        "municipio": "Cáceres, Antioquia",
    }
    fotos = ["galpon-huevos.jpg"]
    h = hash_lote(datos, fotos)
    print(f"Lote    : {datos['codigo']}")
    print(f"SHA-256 : {h}")

    try:
        result = anchor_hash(datos["codigo"], h)
    except StellarError as exc:
        print(f"Error al anclar: {exc}")
        return

    tx = result["tx_hash"]
    print(f"Anclado : tx={tx} ledger={result['ledger']}")

    v = verify_anchor(tx, h)
    status = "VERIFICADO" if v["verified"] else "NO VERIFICADO"
    print(f"Verificación on-chain: {status}")


if __name__ == "__main__":
    main()
