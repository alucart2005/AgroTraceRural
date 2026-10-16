import base64
from unittest.mock import MagicMock, patch

import pytest
from stellar_sdk import Keypair
from stellar_sdk.exceptions import BadRequestError, NotFoundError, Response as HorizonResponse

from app.services.sha256 import hash_lote
from app.services.stellar import StellarError, anchor_hash, verify_anchor

HASH_HEX = hash_lote(
    {
        "codigo": "HUE-2027-001",
        "fecha_cosecha": "2027-03-14",
        "linea_productiva": "Huevos Guarumo",
        "cantidad": 10,
        "unidad": "cubetas",
        "finca": "Finca Guarumo",
        "municipio": "Cáceres, Antioquia",
        "evidencias": [{"nombre": "a.jpg", "tamano": 1}],
    }
)
HASH_B64 = base64.b64encode(bytes.fromhex(HASH_HEX)).decode()
KEYPAIR = Keypair.random()


def _mock_server():
    server = MagicMock()
    account = MagicMock()
    server.load_account.return_value = account
    tx = MagicMock()
    tx.sign.return_value = None
    builder = MagicMock()
    builder.append_payment_op.return_value = builder
    builder.add_hash_memo.return_value = builder
    builder.set_timeout.return_value = builder
    builder.build.return_value = tx
    return server, builder, tx


@patch("app.services.stellar.load_keypair")
@patch("app.services.stellar.get_server")
@patch("app.services.stellar.ensure_funded")
def test_anchor_devuelve_tx_hash_y_ledger(mock_funded, mock_get, mock_kp):
    mock_kp.return_value = KEYPAIR
    server, builder, tx = _mock_server()
    mock_get.return_value = server
    import stellar_sdk

    with patch.object(stellar_sdk, "TransactionBuilder", return_value=builder):
        server.submit_transaction.return_value = {
            "hash": "abc123",
            "ledger": 1000,
            "successful": True,
        }
        result = anchor_hash("HUE-2027-001", HASH_HEX)
    assert result["tx_hash"] == "abc123"
    assert result["ledger"] == 1000


def test_anchor_hash_invalido():
    with pytest.raises(StellarError):
        anchor_hash("X", "zz")


@patch("app.services.stellar.get_server")
def test_verify_ok(mock_get):
    server = MagicMock()
    server.transactions.return_value.transaction.return_value.call.return_value = {
        "memo": HASH_B64,
        "memo_type": "hash",
        "successful": True,
        "ledger": 12345,
    }
    mock_get.return_value = server
    result = verify_anchor("txhash", HASH_HEX)
    assert result["verified"] is True
    assert result["memo_match"] is True


@patch("app.services.stellar.get_server")
def test_verify_memo_distinto(mock_get):
    server = MagicMock()
    server.transactions.return_value.transaction.return_value.call.return_value = {
        "memo": base64.b64encode(b"\x00" * 32).decode(),
        "memo_type": "hash",
        "successful": True,
        "ledger": 1,
    }
    mock_get.return_value = server
    result = verify_anchor("txhash", HASH_HEX)
    assert result["verified"] is False


@patch("app.services.stellar.get_server")
def test_verify_tx_no_existe(mock_get):
    server = MagicMock()
    resp = HorizonResponse(status_code=404, text="not found", headers={}, url="http://x")
    server.transactions.return_value.transaction.return_value.call.side_effect = NotFoundError(resp)
    mock_get.return_value = server
    with pytest.raises(StellarError):
        verify_anchor("nope", HASH_HEX)
