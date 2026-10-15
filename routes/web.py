from pathlib import Path

from renus.config import Config
from renus.request import Request
from renus.response import FileResponse, Status, TextResponse
from renus.router import Router


_PUBLIC_ROOT = Path(Config("app").get("public_folder", "public")).resolve()
_CORS_METHODS = ("GET", "POST", "PUT", "DELETE", "OPTIONS")
_CORS_HEADERS = (
    "Authorization",
    "Content-Type",
    "X-Requested-With",
    "lang",
    "encrypted",
    "real-type",
)
_CORS_VARY = "Origin, Access-Control-Request-Method, Access-Control-Request-Headers"


def _public_file(path: str) -> Path | None:
    """Resolve a public asset while preventing path traversal."""
    candidate = (_PUBLIC_ROOT / path).resolve()
    try:
        candidate.relative_to(_PUBLIC_ROOT)
    except ValueError:
        return None
    return candidate if candidate.is_file() else None


async def index():
    """Serve the public application's entry point."""
    return FileResponse(
        _PUBLIC_ROOT / "index.html",
        headers={"Cache-Control": "max-age=0"},
    )


async def admin(path: str | None = None):
    """Serve the admin application's entry point for all admin paths."""
    return FileResponse(
        _PUBLIC_ROOT / "admin.html",
        headers={"Cache-Control": "max-age=0"},
    )


async def public(path: str, request: Request):
    """Serve a public asset, falling back to the application entry point."""
    del request
    asset = _public_file(path)
    if asset is None:
        return await index()
    return FileResponse(asset, headers={"Cache-Control": "max-age=31536000"})


async def options(path: str, request: Request):
    """Answer CORS preflight requests from configured origins."""
    del path

    configured_origins = Config("app").get("cors_allow", [])
    if configured_origins == "*" or (
        isinstance(configured_origins, (list, tuple, set, frozenset))
        and "*" in configured_origins
    ):
        allowed_origins: set[str] | None = None
    elif isinstance(configured_origins, str):
        allowed_origins = {configured_origins}
    elif isinstance(configured_origins, (list, tuple, set, frozenset)):
        allowed_origins = {
            value for value in configured_origins if isinstance(value, str)
        }
    else:
        allowed_origins = set()

    origin = request.headers.get("origin")
    requested_method = request.headers.get("access-control-request-method")
    if requested_method is not None:
        requested_method = requested_method.strip().upper()
    requested_headers = {
        header.strip().lower()
        for header in request.headers.get("access-control-request-headers", "").split(",")
        if header.strip()
    }
    allowed_headers = {header.lower() for header in _CORS_HEADERS}

    origin_is_allowed = (
        origin is not None
        and (allowed_origins is None or origin in allowed_origins)
    )
    method_is_allowed = (
        requested_method is None or requested_method in _CORS_METHODS
    )
    headers_are_allowed = requested_headers <= allowed_headers

    response_headers: dict[str, str] = {"Vary": _CORS_VARY}
    if not (origin_is_allowed and method_is_allowed and headers_are_allowed):
        return TextResponse(
            "",
            Status.HTTP_405_METHOD_NOT_ALLOWED,
            headers=response_headers,
        )

    response_headers.update(
        {
            "Access-Control-Allow-Methods": ", ".join(_CORS_METHODS),
            "Access-Control-Allow-Headers": ", ".join(_CORS_HEADERS),
        }
    )
    return TextResponse("", headers=response_headers)

router = Router()
router.option("/{path:path}", func=options)
router.get("/", func=index)
router.get("/{path:path}", func=public)

router2 = Router(subdomain=Config("app").get("admin_subdomain", "admin"),)
router2.option("/{path:path}", func=options)
router2.get("/admin", func=admin)
router2.get("/admin/{path:path}", func=admin)
router.get("/{path:path}", func=public)

router.include(router2)

