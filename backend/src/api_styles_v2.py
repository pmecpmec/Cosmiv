from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional
from pipeline.style.profiles import STYLE_PRESETS, analyze_reference
import os

router = APIRouter(prefix="/v2/styles")

@router.get("")
def list_styles():
    return {"presets": list(STYLE_PRESETS.keys())}

@router.post("/reference")
async def upload_reference(name: str = Form("custom"), file: UploadFile = File(...)):
    dest_dir = "/app/storage/references"
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, file.filename)
    with open(dest, "wb") as f:
        f.write(await file.read())
    features = analyze_reference(dest)
    return {"name": name, "features": features, "path": dest}
