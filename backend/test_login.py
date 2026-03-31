import importlib

import pytest

import app as app_module


@pytest.fixture()
def client(tmp_path):
    test_db = tmp_path / "test_login.db"

    module = importlib.reload(app_module)
    module.DATABASE = str(test_db)
    module.init_db()
    module.app.config["TESTING"] = True

    with module.app.test_client() as test_client:
        yield test_client


def test_login_returns_token_for_registered_user(client):
    register_response = client.post(
        "/register",
        json={
            "name": "Login User",
            "email": "test2@example.com",
            "password": "pass",
        },
    )

    assert register_response.status_code == 200

    login_response = client.post(
        "/login",
        json={
            "email": "test2@example.com",
            "password": "pass",
        },
    )

    payload = login_response.get_json()

    assert login_response.status_code == 200
    assert payload["message"] == "Login Successful"
    assert payload["token"]
    assert payload["user"]["email"] == "test2@example.com"


def test_login_rejects_invalid_credentials(client):
    response = client.post(
        "/login",
        json={
            "email": "missing@example.com",
            "password": "wrong",
        },
    )

    assert response.status_code == 401
    assert response.get_json()["message"] == "Invalid Login"
