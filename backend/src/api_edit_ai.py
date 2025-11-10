"""
Cosmiv Edit AI - Commercial API Layer
Provides editing-as-a-service endpoints
"""

import os
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from typing import Optional
from pathlib import Path
from datetime import datetime
import tempfile
import shutil

from cosmiv_edit_ai.editor import EditingAgent
from cosmiv_edit_ai.researcher import KnowledgeCollector
from cosmiv_edit_ai.meta_tracker import MetaTracker
from cosmiv_edit_ai.core.training_loop import TrainingLoop
from cosmiv_edit_ai.core.brain import AIBrain

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Edit AI"])

# Initialize components
_config_path = Path(__file__).parent / "cosmiv_edit_ai" / "core" / "config.json"
_brain = AIBrain(_config_path)
_editor = EditingAgent(_config_path)
_researcher = KnowledgeCollector(_config_path, _brain)
_meta_tracker = MetaTracker(_config_path, _brain)
_training_loop = TrainingLoop(_config_path)

# Start training loop if auto_train is enabled
try:
    _training_loop.start()
except Exception as e:
    logger.warning(f"Could not start training loop: {e}")


@router.post("/edit")
async def edit_video(
    file: UploadFile = File(...),
    edit_style: str = Form("default")
):
    """
    Edit a video using Cosmiv Edit AI
    
    Args:
        file: Video file to edit
        edit_style: Editing style (fast, medium, slow, viral, default)
    
    Returns:
        Edited video file
    """
    if edit_style not in ["fast", "medium", "slow", "viral", "default"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid edit_style. Must be one of: fast, medium, slow, viral, default"
        )
    
    # Create temporary directory for processing
    workdir = tempfile.mkdtemp()
    
    try:
        # Save uploaded file
        input_path = os.path.join(workdir, file.filename)
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"Editing video: {file.filename} with style: {edit_style}")
        
        # Edit video
        result = _editor.edit_video(input_path, edit_style=edit_style)
        output_path = result["output_path"]
        
        if not os.path.exists(output_path):
            raise HTTPException(
                status_code=500,
                detail="Failed to generate edited video"
            )
        
        # Return edited video
        return FileResponse(
            output_path,
            filename=f"edited_{edit_style}_{file.filename}",
            media_type="video/mp4",
            background=BackgroundTask(shutil.rmtree, workdir, True)
        )
    
    except Exception as e:
        shutil.rmtree(workdir, ignore_errors=True)
        logger.error(f"Error editing video: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error editing video: {str(e)}"
        )


@router.post("/train")
async def train_model():
    """
    Trigger a training cycle to update the knowledge base
    
    Returns:
        Training results
    """
    try:
        logger.info("Manual training triggered via API")
        results = _training_loop.train()
        
        return JSONResponse({
            "success": results.get("success", False),
            "started_at": results.get("started_at"),
            "completed_at": results.get("completed_at"),
            "steps": results.get("steps", {}),
            "message": "Training cycle completed"
        })
    
    except Exception as e:
        logger.error(f"Error during training: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error during training: {str(e)}"
        )


@router.get("/status")
async def get_status():
    """
    Get system status including model version, trend profile, and uptime
    
    Returns:
        System status information
    """
    try:
        # Load current status
        from pathlib import Path
        import json
        
        data_dir = Path(__file__).parent / "cosmiv_edit_ai" / "data"
        
        # Get model version (from rules)
        rules_file = data_dir / "editing_rules.json"
        model_version = 1
        if rules_file.exists():
            with open(rules_file, "r") as f:
                rules = json.load(f)
                model_version = rules.get("version", 1)
        
        # Get current trend profile
        patterns_file = data_dir / "trend_patterns.json"
        trend_profile = {}
        if patterns_file.exists():
            with open(patterns_file, "r") as f:
                patterns = json.load(f)
                trend_profile = patterns.get("meta_summary", {})
                trend_profile["last_updated"] = patterns.get("last_updated")
        
        # Get training status
        training_status = _training_loop.get_status()
        
        # Get uptime (simplified - would track actual start time in production)
        from datetime import datetime
        status_file = data_dir / "training_status.json"
        uptime_info = {
            "status": training_status.get("status", "unknown"),
            "last_training": training_status.get("last_training"),
            "training_count": training_status.get("training_count", 0)
        }
        
        return JSONResponse({
            "model_version": model_version,
            "trend_profile": trend_profile,
            "uptime": uptime_info,
            "training": {
                "auto_train": training_status.get("auto_train", False),
                "running": training_status.get("running", False),
                "interval_hours": training_status.get("train_interval_hours", 24)
            },
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting status: {str(e)}"
        )
