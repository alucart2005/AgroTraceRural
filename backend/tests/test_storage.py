from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest

from app.services import storage
from app.services.storage import StorageError, evidence_key, public_url, upload_evidence


def _set_r2(**over):
    vals = {
        "r2_account_id": "acct123",
        "r2_access_key_id": "keyid",
        "r2_secret_access_key": "secret",
        "r2_bucket": "agrotrace-evidence",
        "r2_public_url": "https://pub-abc.r2.dev",
    }
    vals.update(over)
    return patch.multiple(storage.settings, **vals)


def test_is_configured_true():
    with _set_r2():
        assert storage.is_configured() is True


def test_is_configured_false_sin_credenciales():
    with _set_r2(r2_secret_access_key=""):
        assert storage.is_configured() is False


def test_get_s3_client_sin_config_lanza_error():
    with _set_r2(r2_account_id=""):
        with pytest.raises(StorageError):
            storage.get_s3_client()


def test_upload_evidence_sube_y_devuelve_public_url():
    client = MagicMock()
    with _set_r2(), patch.object(storage, "get_s3_client", return_value=client):
        url = upload_evidence("evidencias/HUE-2027-001/a.jpg", BytesIO(b"bin"), "image/jpeg")
    assert url == "https://pub-abc.r2.dev/evidencias/HUE-2027-001/a.jpg"
    client.put_object.assert_called_once()
    kwargs = client.put_object.call_args.kwargs
    assert kwargs["Bucket"] == "agrotrace-evidence"
    assert kwargs["Key"] == "evidencias/HUE-2027-001/a.jpg"
    assert kwargs["ContentType"] == "image/jpeg"


def test_upload_evidence_error_de_s3_lanza_storage_error():
    client = MagicMock()
    client.put_object.side_effect = RuntimeError("boom")
    with _set_r2(), patch.object(storage, "get_s3_client", return_value=client):
        with pytest.raises(StorageError):
            upload_evidence("k", BytesIO(b"x"))


def test_evidence_key_sanitiza_espacios():
    assert evidence_key("HUE-2027-001", "foto una.jpg") == "evidencias/HUE-2027-001/foto_una.jpg"


def test_public_url_sin_base_devuelve_key():
    with _set_r2(r2_public_url=""):
        assert public_url("evidencias/x.jpg") == "evidencias/x.jpg"
