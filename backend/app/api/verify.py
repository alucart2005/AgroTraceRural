from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.stellar import StellarError, verify_anchor

router = APIRouter()


class VerifyRequest(BaseModel):
    tx_hash: str
    hash_hex: str


@router.post("/api/verify")
def verify(req: VerifyRequest):
    try:
        result = verify_anchor(req.tx_hash, req.hash_hex)
    except StellarError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return result
