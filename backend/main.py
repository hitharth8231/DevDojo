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


# --- CORRECTED CORS CONFIGURATION ---
# Support both local development and production
origins = [
    "http://localhost",
    "http://localhost:3000", # Default for Create React App
    "http://localhost:3001", # Common alternative
    "http://localhost:5173", 
]

# Add production frontend URL if specified
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
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


