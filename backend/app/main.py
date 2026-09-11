from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.api.v1.reports import router as reports_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.admin_module import router as admin_module_router
from app.api.v1.user_module import router as user_module_router
from app.api.v1.reception import router as reception_router
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal, sync_db_schema
import app.models  # noqa: F401 Ensure all models are registered with Base.metadata
from app.data.seed import seed_initial_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables, sync schema columns, and seed initial records
    Base.metadata.create_all(bind=engine)
    sync_db_schema()
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield
    # Shutdown logic (if any)


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include primary /fitness router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Also support legacy /api/v1 and direct module prefixes
app.include_router(api_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/admin")
app.include_router(dashboard_router, prefix="/api/admin")
app.include_router(admin_module_router, prefix="/api/admin")
app.include_router(user_module_router, prefix="/api/user")
app.include_router(reception_router, prefix="/api")
app.include_router(reception_router)  # Handles /request directly


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for monitoring and uptime checkers."""
    return {"status": "ok", "service": settings.PROJECT_NAME}
