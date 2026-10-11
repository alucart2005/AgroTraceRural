"""Stellar Testnet anchoring: submit a 32-byte SHA-256 hash as Memo Hash."""

from __future__ import annotations

import time

from stellar_sdk import Asset, Keypair, Network, Server, TransactionBuilder
from stellar_sdk.exceptions import (
    BadRequestError,
    NotFoundError,
    Response as HorizonResponse,
)

from app.core.config import settings


class StellarError(Exception):
    pass


def get_server() -> Server:
    return Server(settings.horizon_url)


def network_passphrase() -> str:
    return Network.TESTNET_NETWORK_PASSPHRASE


def load_keypair() -> Keypair:
    if not settings.stellar_secret_key:
        raise StellarError("STELLAR_SECRET_KEY no configurada")
    return Keypair.from_secret(settings.stellar_secret_key)


def ensure_funded(server: Server, kp: Keypair) -> None:
    """Fund the account via Friendbot if it does not exist on Testnet."""
    try:
        server.load_account(kp.public_key)
    except NotFoundError:
        import httpx

        resp = httpx.post(
            "https://friendbot.stellar.org",
            params={"addr": kp.public_key},
            timeout=15,
        )
        if resp.status_code != 200:
            raise StellarError(f"Friendbot falló: {resp.status_code} {resp.text}")
        time.sleep(2)


def anchor_hash(lote_id: str, hash_hex: str) -> dict:
    """Anchor a 32-byte hash in the Memo Hash of a minimal payment tx.

    Sends 1 stroop of XLM to the same account (minimal operation).
    Retries up to 3 times on transient errors.
    """
    try:
        hash_bytes = bytes.fromhex(hash_hex)
    except ValueError as exc:
        raise StellarError(f"Hash inválido: {exc}") from exc
    if len(hash_bytes) != 32:
        raise StellarError("El hash debe tener exactamente 32 bytes (SHA-256)")

    kp = load_keypair()
    server = get_server()
    ensure_funded(server, kp)

    last_err: Exception | None = None
    for attempt in range(3):
        try:
            account = server.load_account(kp.public_key)
            tx = (
                TransactionBuilder(account, network_passphrase(), base_fee=100)
                .append_payment_op(kp.public_key, Asset.native(), "1")
                .add_hash_memo(hash_bytes)
                .set_timeout(60)
                .build()
            )
            tx.sign(kp)
            resp = server.submit_transaction(tx)
            return {
                "tx_hash": resp["hash"],
                "ledger": resp.get("ledger"),
                "successful": resp.get("successful", False),
            }
        except BadRequestError as exc:
            codes = getattr(exc, "extras", {}).get("result_codes", {})
            if codes.get("transaction") in ("tx_too_late", "tx_bad_seq"):
                last_err = exc
                time.sleep(1)
                continue
            raise StellarError(f"Transacción rechazada: {codes}") from exc
        except Exception as exc:
            last_err = exc
            time.sleep(1)
    raise StellarError(f"No se pudo anclar tras 3 intentos: {last_err}")


def verify_anchor(tx_hash: str, hash_hex: str) -> dict:
    """Verify that the transaction succeeded and its memo matches the hash.

    Horizon returns hash memos as base64, so we decode before comparing.
    """
    import base64

    try:
        expected = bytes.fromhex(hash_hex)
    except ValueError as exc:
        raise StellarError(f"Hash inválido: {exc}") from exc

    server = get_server()
    try:
        tx = server.transactions().transaction(tx_hash).call()
    except NotFoundError:
        raise StellarError("Transacción no encontrada en Horizon")

    memo_ok = False
    if tx.get("memo_type") == "hash":
        try:
            memo_bytes = base64.b64decode(str(tx.get("memo", "")), validate=True)
            memo_ok = memo_bytes == expected
        except Exception:
            memo_ok = False

    successful = bool(tx.get("successful"))
    return {
        "verified": successful and memo_ok,
        "memo_match": memo_ok,
        "successful": successful,
        "ledger": tx.get("ledger"),
    }
