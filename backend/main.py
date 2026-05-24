from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from middleware.db import connect_db, disconnect_db

# ─── Import all routers ────────────────────────────────────────────────────────
from routes.auth     import router as auth_router
from routes.projects import router as projects_router
from routes.tasks    import router as tasks_router
from routes.invites  import router as invites_router
from routes.branches import router as branches_router

# ─── App init ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="TaskFlow API",
    description="Team task manager with git-style branch tracking",
    version="1.0.0"
)

# ─── CORS — allows React frontend to call this API ────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── DB lifecycle — connect on start, disconnect on stop ──────────────────────
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# ─── Register all routers ─────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(invites_router)
app.include_router(branches_router)

@app.get("/")
async def root():
    return {"message": "TaskFlow API is running ", "docs": "/docs"}
