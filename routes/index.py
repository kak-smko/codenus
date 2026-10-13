from app.extension.codenus.activity.plugin import activity_middleware
from app.extension.codenus.tracker.middleware import TrackerMiddleware
from routes.web import router as web_router
from routes.api import router as api_router

from renus.router import Router


router = Router()
router.include(api_router,middlewares=[
    TrackerMiddleware(),activity_middleware
])
router.include(web_router)