from fastapi import APIRouter

from .v1 import run_code

router = APIRouter(
    prefix="/api",
)

router.include_router(run_code.router)




