from app.services.sha256 import hash_canonico, hash_lote


def test_hash_determinista():
    d = {"a": 1, "b": 2}
    assert hash_canonico(d) == hash_canonico(d)


def test_hash_independiente_del_orden():
    assert hash_canonico({"a": 1, "b": 2}) == hash_canonico({"b": 2, "a": 1})


def test_hash_sensible_a_cambios():
    assert hash_canonico({"a": 1}) != hash_canonico({"a": 2})


def test_hash_lote_con_fotos():
    datos = {"codigo": "HUE-2027-001", "cantidad": 10}
    h1 = hash_lote(datos, ["a.jpg", "b.jpg"])
    h2 = hash_lote(datos, ["b.jpg", "a.jpg"])
    assert h1 == h2  # sorted


def test_hash_lote_sin_fotos():
    datos = {"codigo": "HUE-2027-001"}
    h = hash_lote(datos)
    assert len(h) == 64


def test_hash_lote_fotos_cambiadas():
    datos = {"codigo": "X"}
    assert hash_lote(datos, ["a.jpg"]) != hash_lote(datos, ["b.jpg"])
