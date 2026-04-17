from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os
from fastapi.middleware.cors import CORSMiddleware
from api.router import router
from dotenv import load_dotenv
from init_db import create_tables
load_dotenv()


app = FastAPI(title="DOJO Backend")


# Call this function right at the top, before anything else.
create_tables()


# Support both local development and production.
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
]

# Accept a comma-separated allowlist from the environment so production can
# support the main Vercel URL and any custom domain without code changes.
frontend_urls = os.getenv("FRONTEND_URL", "")
if frontend_urls:
    origins.extend(
        url.strip()
        for url in frontend_urls.split(",")
        if url.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    # Allow Vercel preview/prod subdomains without manually updating CORS.
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print("Unhandled exception:", traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# Register all routers
app.include_router(router)

@app.get("/")
def root():
    return {"message": "Welcome to the DOJO backend!"}


