import importlib.util
from pathlib import Path


ROOT_APP_PATH = Path(__file__).resolve().parents[2] / "app.py"


def load_root_app():
    spec = importlib.util.spec_from_file_location("careflow_root_app", ROOT_APP_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


root_app = load_root_app()
app = root_app.app


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
