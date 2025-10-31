## Architecture Overview

- **Current state**: `backend/` hosts a monolithic FastAPI/Celery stack, `src/` is a React SPA, and AI logic lives alongside backend services under `backend/src/pipeline` and `backend/src/ml`.
- **Objective**: Evolve toward a modular system that cleanly separates product surfaces (backend API, web client, AI workers) while keeping the MVP lightweight and enabling the “Big Road” expansion to add new pipelines, models, and deployment targets without rewrites.

## Target Modular Layout

```
/
├── apps/
│   ├── backend/              # API + orchestration service
│   ├── frontend/             # React (or future clients)
│   └── ai/                   # Model serving, training, experimentation
├── packages/
│   ├── pipelines/            # Clip/AI/render pipeline implementations (importable)
│   ├── domain/               # Shared domain models & business rules
│   └── shared/               # Cross-cutting utilities (logging, config, messaging)
├── infra/                    # IaC, Docker, k8s charts, observability configs
└── docs/
    └── architecture.md
```

- **MVP**: reuse the existing code inside `backend/` and `src/` but expose it through the interfaces described below. Pipelines can stay in-process with Celery workers backed by Redis.
- **Big Road**: promote pipelines into `packages/pipelines`, move AI models into `apps/ai`, and scale via independent deployables (containers, serverless functions) communicating through a message bus or event stream.

## Backend (apps/backend)

- **Layers**
  - `api/`: FastAPI (or equivalent) routers and response schemas.
  - `application/`: service-layer orchestrations orchestrating pipelines, job tracking, and transactional boundaries.
  - `domain/`: aggregates, value objects, policies governing clip lifecycle.
  - `infrastructure/`: adapters to persistence (`storage/`), messaging (Celery, Kafka), external APIs, and feature flags.
- **Packages**
  - `jobs/`: Celery task definitions wrapping pipeline entry points.
  - `services/`: high-level units such as `ClipService`, `HighlightService`, `RenderService`, each depending on interfaces rather than concrete implementations.
  - `adapters/`: integration adapters for cloud storage, payment gateways, social networks.
- **Scaling path**: Each service can be extracted into its own deployable if throughput or isolation demands increase.

## Frontend (apps/frontend)

- Maintain a single-page app (React today) that consumes backend APIs and subscribes to WebSocket/SSE channels for job progress.
- Prepare for micro-frontend or multi-client support by colocating shared UI logic in `packages/shared/ui` (e.g., design system, API SDK clients).
- Introduce a generated API client (OpenAPI -> TypeScript) housed in `packages/shared/api-client` so that backend contract changes propagate automatically.

## AI Workspace (apps/ai)

- **Structure**
  - `models/`: serialized weights, inference graphs, evaluation configs.
  - `services/`: inference servers (FastAPI, Triton, etc.) and feature extraction workers.
  - `experiments/`: notebooks, scripts, data catalog metadata.
  - `training/`: pipelines for labeling, retraining, validation.
- **Interface Alignment**: share the same domain contracts defined in `packages/domain`. AI services expose gRPC/REST endpoints and publish events consumed by `apps/backend`.
- **Big Road**: integrate feature stores, online/offline evaluation, and multi-model A/B infrastructure without touching backend APIs.

## Cross-Cutting Infrastructure

- **Messaging/Eventing**: Standardize on a broker abstraction (`MessageBus` interface) to hide Celery/Redis details today and allow Kafka/PubSub tomorrow.
- **Configuration**: Centralize environment management via `shared/config`, supporting 12-factor deployments.
- **Observability**: Instrument pipelines with OpenTelemetry; store traces/logs centrally for multi-service debugging.
- **Data Contracts**: Use Pydantic (Python) and Zod (TypeScript) schemas generated from a shared source (`packages/domain/schemas`) to avoid drift.

## Pipeline Interface Contracts

### Clip Processing Interface

```startLine:39:docs/architecture.md
class ClipProcessingRequest(BaseModel):
    clip_id: str
    source_uri: str
    target_format: Literal["mp4", "webm", "gif"]
    operations: list[ClipOperation]


class ClipProcessingResult(BaseModel):
    clip_id: str
    output_uri: str
    artifacts: list[Artifact]
    processing_time_ms: int


class ClipProcessingService(Protocol):
    def prepare(self, request: ClipProcessingRequest) -> None:
        """Validate input, allocate temp storage, enqueue work."""

    def execute(self, request: ClipProcessingRequest) -> ClipProcessingResult:
        """Run the configured operations (transcode, normalize audio, etc.)."""

    def cleanup(self, clip_id: str) -> None:
        """Remove temp data and emit completion events."""
```

- **MVP**: Implement as Celery task calling FFmpeg utilities under `packages/pipelines/clip_processing`.
- **Big Road**: Swap `ClipProcessingService` with a microservice backed by autoscaling GPU workers while keeping the same protocol for backend callers.

### Highlight Detection Interface

```startLine:68:docs/architecture.md
class HighlightDetectionRequest(BaseModel):
    clip_id: str
    media_uri: str
    model_version: str | None = None
    detection_profile: HighlightProfile


class HighlightDetectionResult(BaseModel):
    clip_id: str
    highlights: list[HighlightSpan]
    model_version: str
    inference_ms: int
    confidence_summary: dict[str, float]


class HighlightDetectionEngine(Protocol):
    def detect(self, request: HighlightDetectionRequest) -> HighlightDetectionResult:
        """Run inference using the configured model and return highlight spans."""

    def warm_start(self, model_version: str) -> None:
        """Preload model weights/cache for low-latency requests."""

    def supports_profile(self, profile: HighlightProfile) -> bool:
        """Advertise compatibility for routing and fallback logic."""
```

- **MVP**: Implement via synchronous Python wrapper around the existing `ml/highlights/model.py` model, invoked inside backend workers.
- **Big Road**: Deploy multiple inference backends (e.g., transformer, heuristic) registered in a service registry; routing logic chooses engine based on `detection_profile`.

### Rendering Pipeline Interface

```startLine:99:docs/architecture.md
class RenderRequest(BaseModel):
    clip_id: str
    timeline_uri: str
    template_id: str
    format: Literal["vertical", "horizontal"]
    destination: RenderDestination


class RenderResult(BaseModel):
    clip_id: str
    render_uri: str
    duration_ms: int
    outputs: list[RenderArtifact]


class RenderPipeline(Protocol):
    def compile(self, request: RenderRequest) -> Timeline:
        """Assemble scenes, overlays, and audio tracks into a timeline object."""

    def render(self, request: RenderRequest) -> RenderResult:
        """Produce final media assets and publish delivery events."""

    def cancel(self, clip_id: str) -> None:
        """Abort long-running renders and clean up resources."""
```

- **MVP**: Provide a single renderer using FFmpeg overlays triggered by Celery tasks.
- **Big Road**: Introduce distributed rendering (e.g., AWS MediaConvert, WebGL-based previews) by implementing additional `RenderPipeline` classes without touching callers.

## Orchestration & Data Flow

1. Backend API receives job -> persists request via `domain` aggregate -> emits `JobRequested` event.
2. Celery worker (MVP) or message bus consumer (Big Road) triggers the appropriate pipeline implementation.
3. Pipeline publishes progress events (`JobProgressed`, `JobCompleted`, `JobFailed`) consumed by backend for state updates and by frontend over WebSockets.
4. AI services access shared storage via signed URLs; results stored in `domain` repositories and surfaced to frontend dashboards.

## Migration Strategy

- **Phase 0**: Document contracts (this file) and extract shared schemas (`packages/domain`).
- **Phase 1 (MVP hardening)**: Wrap existing FFmpeg and highlight logic behind the new interfaces; isolate Celery tasks to delegators only.
- **Phase 2 (Big Road)**: Split deployables, introduce message bus abstractions, adopt IaC modules for AI workers, and gradually move specialized logic into dedicated packages.

This roadmap keeps today’s functionality intact while creating clear seams to add new models, rendering engines, or API surfaces without large-scale rewrites.
