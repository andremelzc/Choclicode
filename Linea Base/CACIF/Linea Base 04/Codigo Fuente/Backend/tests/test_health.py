"""Tests de health check — verifican que la app FastAPI arranca correctamente."""


def test_root_returns_200(client):
    """GET / debe retornar 200 con el mensaje de salud."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "CACIF Backend funcionando" in data["message"]
    assert "version" in data


def test_root_contains_version(client):
    """GET / debe incluir la versión actual del backend."""
    response = client.get("/")
    data = response.json()
    assert data["version"] == "0.1.0"
