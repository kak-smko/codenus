from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from renus.app import App
from renus.config import Config
from renus.db import Database

from app.extension.codenus.activity.plugin import ActivityPlugin
from routes.index import router


# uncomment if you want use Crypto
# from extension.codenus.user.crypt import Crypto
#
# JsonResponse.cryptor = Crypto
# Request.cryptor = Crypto


def _adapter():
    """Build the ``renus.db`` adapter declared by ``config/database.py``."""
    cfg = Config("database")
    adapter=cfg.get("adapter",None)
    if adapter:
        return adapter

    raise SystemExit(f"Unsupported database adapter")


db = Database(_adapter())
activity_plugin = ActivityPlugin()
db.use(activity_plugin)


async def on_startup() -> None:
    """Connect the database when the application starts serving."""
    await db.connect()
    # Create tables/collections for your models, e.g.:
    #todo await db.create_schema([MyModel])


async def on_shutdown() -> None:
    """Release the database connection when the application stops."""
    await db.disconnect()


app = App(
    on_startup=[on_startup],
    on_shutdown=[on_shutdown],
)

# The Database is app-scoped: controllers and extensions reach it through the
# request (``request.db`` / ``request.db.repository(Model)``).
app.state["db"] = db
app.include(router)


def main() -> None:
    """Run the scheduler once alongside the web server."""
    project_dir = Path(__file__).resolve().parent
    job = subprocess.Popen(
        [sys.executable, str(project_dir / "job" / "public.py")],
        cwd=project_dir,
    )

    try:
        if Config("app").get("debug", False):
            options = {
                "host": "127.0.0.1",
                "port": 4000,
                "server_header": False,
                "log_level": "info",
                "headers": [
                    ("X-Frame-Options", "DENY"),
                    ("Access-Control-Allow-Origin", "*")
                ],
            }
            app.run("main:app", reload=True, **options)
        else:
            options = {
                "host": "0.0.0.0",
                "port": 4000,
                "server_header": False,
                "log_level": "error",
                "headers": [
                    ("X-Frame-Options", "DENY")
                ],
            }
            app.run("main:app", workers=8, **options)
    finally:
        job.terminate()
        try:
            job.wait(timeout=5)
        except subprocess.TimeoutExpired:
            job.kill()
            job.wait()


if __name__ == "__main__":
    main()
