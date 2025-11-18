"""
API Endpoints for Frontend Learning System
Provides access to learned design patterns and trends
"""

import json
import logging
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlmodel import select

from db import get_session
from models_ai import FrontendPattern, DesignTrend, ScrapingJob
from services.frontend_learner.parser import PatternParser
from services.frontend_learner.vectorizer import PatternVectorizer
from services.frontend_learner.learner import PatternLearner

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v2/frontend-learning", tags=["Frontend Learning"])


@router.get("/patterns")
async def get_patterns(
    style: Optional[str] = Query(None, description="Filter by style (e.g., glassmorphism)"),
    layout: Optional[str] = Query(None, description="Filter by layout type"),
    min_alignment: Optional[float] = Query(0.0, description="Minimum Cosmiv alignment score"),
    limit: int = Query(20, description="Maximum number of results"),
    skip: int = Query(0, description="Number of results to skip"),
):
    """
    Get learned front-end design patterns

    Query parameters:
    - style: Filter by style type
    - layout: Filter by layout type (flex, grid, absolute)
    - min_alignment: Minimum brand alignment score (0-1)
    - limit: Maximum results (default: 20)
    - skip: Pagination offset
    """
    try:
        with get_session() as session:
            query = select(FrontendPattern)

            # Apply filters
            if layout:
                query = query.where(FrontendPattern.layout_type == layout)

            if min_alignment:
                query = query.where(
                    FrontendPattern.cosmiv_alignment_score >= min_alignment
                )

            # Order by alignment score (highest first)
            query = query.order_by(
                FrontendPattern.cosmiv_alignment_score.desc().nulls_last()
            )

            # Pagination
            query = query.offset(skip).limit(limit)

            patterns = session.exec(query).all()

            # Filter by style if provided
            if style:
                filtered_patterns = []
                for pattern in patterns:
                    pattern_data = json.loads(pattern.pattern_data)
                    if style.lower() in str(pattern_data).lower():
                        filtered_patterns.append(pattern)
                patterns = filtered_patterns

            # Format response
            results = []
            for pattern in patterns:
                pattern_data = json.loads(pattern.pattern_data)
                results.append(
                    {
                        "pattern_id": pattern.pattern_id,
                        "source_url": pattern.source_url,
                        "layout_type": pattern.layout_type,
                        "colors": json.loads(pattern.colors) if pattern.colors else [],
                        "fonts": json.loads(pattern.fonts) if pattern.fonts else [],
                        "components": json.loads(pattern.components)
                        if pattern.components
                        else [],
                        "animations": json.loads(pattern.animations)
                        if pattern.animations
                        else [],
                        "gradients": json.loads(pattern.gradients)
                        if pattern.gradients
                        else [],
                        "cosmiv_alignment_score": pattern.cosmiv_alignment_score,
                        "popularity_score": pattern.popularity_score,
                        "created_at": pattern.created_at.isoformat(),
                    }
                )

            return {
                "patterns": results,
                "total": len(results),
                "limit": limit,
                "skip": skip,
            }
    except Exception as e:
        from security import sanitize_log_message
        safe_error = sanitize_log_message(str(e))
        logger.error(f"Failed to get patterns: {safe_error}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/patterns/{pattern_id}")
async def get_pattern(pattern_id: str):
    """Get a specific pattern by ID"""
    try:
        with get_session() as session:
            pattern = session.exec(
                select(FrontendPattern).where(FrontendPattern.pattern_id == pattern_id)
            ).first()

            if not pattern:
                raise HTTPException(status_code=404, detail="Pattern not found")

            pattern_data = json.loads(pattern.pattern_data)
            return {
                "pattern_id": pattern.pattern_id,
                "source_url": pattern.source_url,
                "layout_type": pattern.layout_type,
                "colors": json.loads(pattern.colors) if pattern.colors else [],
                "fonts": json.loads(pattern.fonts) if pattern.fonts else [],
                "components": json.loads(pattern.components) if pattern.components else [],
                "animations": json.loads(pattern.animations) if pattern.animations else [],
                "gradients": json.loads(pattern.gradients) if pattern.gradients else [],
                "cosmiv_alignment_score": pattern.cosmiv_alignment_score,
                "popularity_score": pattern.popularity_score,
                "created_at": pattern.created_at.isoformat(),
                "pattern_data": pattern_data,
            }
    except HTTPException:
        raise
    except Exception as e:
        # Sanitize error message to prevent information exposure
        from security import sanitize_log_message
        safe_error = sanitize_log_message(str(e))
        logger.error(f"Failed to get pattern: {safe_error}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/search")
async def search_patterns(
    query: str = Query(..., description="Semantic search query"),
    limit: int = Query(5, description="Maximum number of results"),
    min_score: float = Query(0.3, description="Minimum similarity score"),
):
    """Search patterns using semantic search"""
    try:
        vectorizer = PatternVectorizer()
        results = vectorizer.search_similar(query, limit=limit, min_score=min_score)

        # Load full pattern data for results
        pattern_details = []
        with get_session() as session:
            for result in results:
                pattern_id = result["pattern_id"]
                pattern = session.exec(
                    select(FrontendPattern).where(
                        FrontendPattern.pattern_id == pattern_id
                    )
                ).first()

                if pattern:
                    pattern_details.append(
                        {
                            "pattern_id": pattern.pattern_id,
                            "source_url": pattern.source_url,
                            "similarity_score": result["score"],
                            "layout_type": pattern.layout_type,
                            "colors": json.loads(pattern.colors) if pattern.colors else [],
                            "components": json.loads(pattern.components)
                            if pattern.components
                            else [],
                        }
                    )

        return {
            "query": query,
            "results": pattern_details,
            "total": len(pattern_details),
        }
    except Exception as e:
        from security import sanitize_log_message
        safe_error = sanitize_log_message(str(e))
        logger.error(f"Failed to search patterns: {safe_error}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/trends")
async def get_trends(
    trend_type: Optional[str] = Query(None, description="Filter by trend type"),
    limit: int = Query(10, description="Maximum number of results"),
):
    """Get design trend analytics"""
    try:
        learner = PatternLearner()
        principles = learner.load_design_principles()

        trends = principles.get("trends", {})

        # Filter by type if provided
        if trend_type:
            trends = {trend_type: trends.get(trend_type, [])}

        # Limit results
        for key in trends:
            trends[key] = trends[key][:limit]

        return {
            "trends": trends,
            "cosmiv_recommendations": principles.get("cosmiv_recommendations", []),
            "updated_at": principles.get("updated_at"),
            "pattern_count": principles.get("pattern_count", 0),
        }
    except Exception as e:
        from security import sanitize_log_message
        safe_error = sanitize_log_message(str(e))
        logger.error(f"Failed to get trends: {safe_error}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/learn")
async def trigger_learning():
    """
    Manually trigger front-end learning process

    This will:
    1. Parse existing HTML/CSS snapshots
    2. Vectorize patterns
    3. Update design principles

    Note: Scraping functionality has been removed.
    """
    try:
        parser = PatternParser()
        vectorizer = PatternVectorizer()
        learner = PatternLearner()

        # Note: Scraping has been removed. This endpoint now only processes existing data.
        logger.warning("Scraping functionality has been removed. Only processing existing patterns.")

        # Step 1: Update design principles from existing patterns
        logger.info("Updating design principles from existing patterns...")
        principles = learner.generate_design_principles()

        return {
            "status": "completed",
            "message": "Scraping functionality removed. Only design principles updated from existing patterns.",
            "principles_updated": True,
            "trends_detected": len(principles.get("trends", {})),
        }
    except Exception as e:
        from security import sanitize_log_message
        safe_error = sanitize_log_message(str(e))
        logger.error(f"Failed to trigger learning: {safe_error}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/jobs")
async def get_scraping_jobs(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, description="Maximum number of results"),
):
    """Get scraping job history"""
    try:
        with get_session() as session:
            query = select(ScrapingJob)

            if status:
                query = query.where(ScrapingJob.status == status)

            query = query.order_by(ScrapingJob.created_at.desc()).limit(limit)

            jobs = session.exec(query).all()

            return {
                "jobs": [
                    {
                        "job_id": job.job_id,
                        "target_url": job.target_url,
                        "status": job.status,
                        "pages_scraped": job.pages_scraped,
                        "patterns_extracted": job.patterns_extracted,
                        "started_at": job.started_at.isoformat() if job.started_at else None,
                        "completed_at": job.completed_at.isoformat()
                        if job.completed_at
                        else None,
                        "error_message": job.error_message,
                    }
                    for job in jobs
                ],
                "total": len(jobs),
            }
    except Exception as e:
        from security import sanitize_log_message
        safe_error = sanitize_log_message(str(e))
        logger.error(f"Failed to get scraping jobs: {safe_error}")
        raise HTTPException(status_code=500, detail="Internal server error")

