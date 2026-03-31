import importlib.util
from pathlib import Path


BACKEND_APP_PATH = Path(__file__).resolve().parent / "backend" / "app.py"


def load_backend_app():
    spec = importlib.util.spec_from_file_location("careflow_backend_app", BACKEND_APP_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


backend_app = load_backend_app()
app = backend_app.app


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
