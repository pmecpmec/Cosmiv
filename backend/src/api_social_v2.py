from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
from typing import Optional

router = APIRouter(prefix="/v2/social")

@router.post("/post")
def schedule_post(job_id: str = Form(...), platform: str = Form("tiktok")):
    # Mock schedule id
    return {"scheduled": True, "platform": platform, "job_id": job_id, "schedule_id": f"{platform}-{job_id}"}
