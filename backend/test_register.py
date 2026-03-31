import importlib

import pytest

import app as app_module


@pytest.fixture()
def client(tmp_path):
    test_db = tmp_path / "test_register.db"

    module = importlib.reload(app_module)
    module.DATABASE = str(test_db)
    module.init_db()
    module.app.config["TESTING"] = True

    with module.app.test_client() as test_client:
        yield test_client


def test_register_creates_patient_account(client):
    response = client.post(
        "/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "pass",
        },
    )

    assert response.status_code == 200
    assert response.get_json()["message"] == "User Registered Successfully"


def test_register_rejects_duplicate_email(client):
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "pass",
    }

    first_response = client.post("/register", json=payload)
    second_response = client.post("/register", json=payload)

    assert first_response.status_code == 200
    assert second_response.status_code == 400
    assert second_response.get_json()["message"] == "Email already registered"
