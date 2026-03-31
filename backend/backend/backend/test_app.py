import importlib
import sys

import pytest

sys.path.insert(0, ".")

import app as app_module


@pytest.fixture()
def client(tmp_path):
    test_db = tmp_path / "test_app.db"

    module = importlib.reload(app_module)
    module.DATABASE = str(test_db)
    module.init_db()
    module.app.config["TESTING"] = True

    with module.app.test_client() as test_client:
        yield test_client


def test_root_route_returns_service_message(client):
    response = client.get("/")

    assert response.status_code == 200
    assert "Doctor Appointment" in response.data.decode()


def test_health_route_returns_backend_status(client):
    response = client.get("/test")

    assert response.status_code == 200
    assert response.get_json()["message"] == "Backend is working"
