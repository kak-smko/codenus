from pathlib import Path

from renus.config import Config
from renus.request import Request
from renus.response import FileResponse
from renus.router import Router


_PUBLIC_ROOT = Path(Config("app").get("public_folder", "public")).resolve()


def _public_file(path: str) -> Path | None:
    """Resolve a public asset while preventing path traversal."""
    candidate = (_PUBLIC_ROOT / path).resolve()
    try:
        candidate.relative_to(_PUBLIC_ROOT)
    except ValueError:
        return None
    return candidate if candidate.is_file() else None


async def index(request: Request):
    """Serve the public application's entry point."""
    return FileResponse(
        _PUBLIC_ROOT / "index.html",
        headers={"Cache-Control": "max-age=0"},
    )


async def admin(path: str | None = None, request: Request | None = None):
    """Serve the admin application's entry point for all admin paths."""
    del path, request
    return FileResponse(
        _PUBLIC_ROOT / "admin.html",
        headers={"Cache-Control": "max-age=0"},
    )


async def public(path: str, request: Request):
    """Serve a public asset, falling back to the application entry point."""
    del request
    asset = _public_file(path)
    if asset is None:
        return await index(request=None)  # type: ignore[arg-type]
    return FileResponse(asset, headers={"Cache-Control": "max-age=31536000"})



router = Router()
router.get("/", func=index)
router.get("/{path:path}", func=public)

router2 = Router(subdomain=Config("app").get("admin_subdomain", "admin"),)
router2.get("/admin", func=admin)
router2.get("/admin/{path:path}", func=admin)
router.get("/{path:path}", func=public)

router.include(router2)

