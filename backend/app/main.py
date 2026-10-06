"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.api import incidents, work_orders, routes as routes_api

app = FastAPI(title="FixitAI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(incidents.router)
app.include_router(work_orders.router)
app.include_router(routes_api.router)


from app.services import get_inference_service

@app.get("/api/health")
def health():
    service = get_inference_service()
    return {
        "status": "ok",
        "cuda_available": service.is_cuda_available(),
        "is_real_ai": service.is_real_model()
    }
