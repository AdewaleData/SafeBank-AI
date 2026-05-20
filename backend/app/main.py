import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import admin, analytics, auth, dashboard, fraud, freeze, offline, settings, transactions

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("safebank")

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app = FastAPI(
    title="SafeBank AI API",
    description="Intelligent banking API with fraud detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin", CORS_ORIGINS[0])
    if origin not in CORS_ORIGINS:
        origin = CORS_ORIGINS[0]
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    origin = request.headers.get("origin", CORS_ORIGINS[0])
    if origin not in CORS_ORIGINS:
        origin = CORS_ORIGINS[0]
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(fraud.router)
app.include_router(freeze.router)
app.include_router(settings.router)
app.include_router(offline.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    logger.info("Health check")
    return {"status": "ok", "service": "SafeBank AI API"}
