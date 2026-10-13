from __future__ import annotations

import signal
import threading

from renus.cache import Cache
from renus.schedule import Schedule

def ping() -> None:
    print("pong")


def run() -> None:
    """Run periodic public-app maintenance jobs until the process is stopped."""
    cache = Cache()
    schedule = Schedule()
    stop_event = threading.Event()

    def request_shutdown(_signum: int, _frame: object) -> None:
        stop_event.set()

    signal.signal(signal.SIGINT, request_shutdown)
    signal.signal(signal.SIGTERM, request_shutdown)

    while not stop_event.is_set():
        schedule.every(2).hours().do("delete_expired", cache.delete_expired)
        
        schedule.run(parallel=True)
        stop_event.wait(1)


if __name__ == "__main__":
    run()
