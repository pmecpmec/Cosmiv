"""
AI System Models for Phase 14
"""

from sqlmodel import SQLModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import json


class ContentVersion(SQLModel, table=True):
    """Version tracking for AI-generated content"""

    id: Optional[int] = Field(default=None, primary_key=True)
    content_id: str = Field(index=True)  # e.g., "landing_hero", "feature_1"
    content_type: str = Field(index=True)  # "landing", "feature", "blog", etc.
    version: int = Field(default=1, index=True)
    content_data: str  # JSON: {"title": "...", "description": "...", "html": "..."}
    generated_by: str = Field(default="ai")  # "ai", "human", "hybrid"
    status: str = Field(default="draft")  # "draft", "published", "archived"
    performance_score: Optional[float] = None  # Engagement metrics
    created_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None


class CodeGeneration(SQLModel, table=True):
    """Track AI-generated code"""

    id: Optional[int] = Field(default=None, primary_key=True)
    generation_id: str = Field(index=True, unique=True)
    code_type: str = Field(index=True)  # "frontend", "backend", "component", "endpoint"
    language: str = Field(default="javascript")  # "javascript", "python", "typescript"
    original_spec: str  # User description or specification
    generated_code: str  # The generated code
    file_path: Optional[str] = None  # Where it was saved
    status: str = Field(
        default="generated"
    )  # "generated", "reviewed", "deployed", "rejected"
    review_notes: Optional[str] = None
    created_by: Optional[str] = None  # User ID who requested it
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deployed_at: Optional[datetime] = None


class UXAnalysis(SQLModel, table=True):
    """Store UX analysis results and improvements"""

    id: Optional[int] = Field(default=None, primary_key=True)
    analysis_id: str = Field(index=True, unique=True)
    component_path: Optional[str] = None  # Frontend component path
    page_url: Optional[str] = None  # Page or route
    analysis_type: str = Field(
        index=True
    )  # "heatmap", "accessibility", "performance", "a11y"
    metrics: str  # JSON: {"score": 85, "issues": [...], "recommendations": [...]}
    status: str = Field(
        default="pending"
    )  # "pending", "analyzed", "improved", "deployed"
    improvement_suggestions: Optional[str] = None  # JSON array of suggestions
    created_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None
    improved_at: Optional[datetime] = None


class AITask(SQLModel, table=True):
    """Track AI system tasks and their status"""

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: str = Field(index=True, unique=True)
    task_type: str = Field(
        index=True
    )  # "content_renewal", "code_generation", "ux_analysis", "video_enhancement"
    status: str = Field(
        default="pending", index=True
    )  # "pending", "processing", "completed", "failed"
    input_data: str  # JSON: task-specific input
    output_data: Optional[str] = None  # JSON: task-specific output
    error_message: Optional[str] = None
    created_by: Optional[str] = None  # User ID (if user-initiated)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class VideoEnhancement(SQLModel, table=True):
    """Track AI video enhancement operations"""

    id: Optional[int] = Field(default=None, primary_key=True)
    enhancement_id: str = Field(index=True, unique=True)
    job_id: Optional[str] = Field(index=True)  # Link to original job
    enhancement_type: str = Field(
        index=True
    )  # "captions", "transitions", "color_grade", "effects", "motion_graphics"
    input_video_path: str
    output_video_path: Optional[str] = None
    enhancement_params: str  # JSON: enhancement-specific parameters
    status: str = Field(
        default="pending"
    )  # "pending", "processing", "completed", "failed"
    quality_score: Optional[float] = None  # AI-evaluated quality improvement
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class FrontendPattern(SQLModel, table=True):
    """Store extracted front-end design patterns"""

    id: Optional[int] = Field(default=None, primary_key=True)
    pattern_id: str = Field(index=True, unique=True)
    source_url: str = Field(index=True)
    pattern_type: str = Field(
        index=True
    )  # "layout", "component", "color", "typography", "animation"
    pattern_data: str  # JSON: extracted pattern data
    layout_type: Optional[str] = None  # "flex", "grid", "absolute", "responsive"
    colors: Optional[str] = None  # JSON array of colors
    fonts: Optional[str] = None  # JSON array of fonts
    components: Optional[str] = None  # JSON array of component types
    animations: Optional[str] = None  # JSON array of animation types
    gradients: Optional[str] = None  # JSON array of gradient definitions
    cosmiv_alignment_score: Optional[float] = None  # 0-1 score for brand alignment
    popularity_score: Optional[float] = None  # 0-1 score for trend popularity
    embedding: Optional[str] = None  # Base64 encoded embedding vector
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DesignTrend(SQLModel, table=True):
    """Track design trend analytics over time"""

    id: Optional[int] = Field(default=None, primary_key=True)
    trend_id: str = Field(index=True, unique=True)
    trend_name: str = Field(index=True)  # e.g., "Glassmorphism", "Neon Gradients"
    trend_type: str = Field(
        index=True
    )  # "style", "color", "layout", "animation", "typography"
    trend_data: str  # JSON: trend-specific data
    popularity_score: float = Field(default=0.0, index=True)  # 0-1 score
    detected_count: int = Field(default=0)  # Number of times detected
    first_detected_at: datetime = Field(default_factory=datetime.utcnow)
    last_detected_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ScrapingJob(SQLModel, table=True):
    """Track front-end learning scraping operations"""

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True, unique=True)
    target_url: str = Field(index=True)
    status: str = Field(
        default="pending", index=True
    )  # "pending", "scraping", "parsing", "completed", "failed"
    pages_scraped: int = Field(default=0)
    patterns_extracted: int = Field(default=0)
    error_message: Optional[str] = None
    snapshot_path: Optional[str] = None  # Path to saved HTML/CSS
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)