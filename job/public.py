from __future__ import annotations
import asyncio
import os
from pathlib import Path
import signal
import sys
from renus.log import Log

project_root = Path(__file__).resolve().parent.parent
os.chdir(project_root)
sys.path.insert(0, str(project_root))

from renus.cache import Cache
from renus.request import Request
from renus.schedule import Schedule

from main import db


async def receive() -> dict[str, object]:
    """Provide an empty ASGI request body for the synthetic controller request."""
    return {
        "type": "http.request",
        "body": b"",
        "more_body": False,
    }


async def run() -> None:
    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()

    for signum in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(signum, stop_event.set)

    request = Request({"type": "http"}, receive)
    request.state["db"] = db
    await db.connect()
    cache = Cache()
    schedule = Schedule()
    Log().info("job start")
    while not stop_event.is_set():
        schedule.every(2).hours().do(
            "delete_expired",
            cache.adelete_expired,
        )

        await schedule.run(parallel=True)

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=1)
        except TimeoutError:
            pass
    await db.disconnect()
    Log().info("job done")


if __name__ == "__main__":
    asyncio.run(run())
