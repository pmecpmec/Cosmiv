"""
AI Code Generator Service
Generate frontend and backend code using AI
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from db import get_session
from sqlmodel import select
from models_ai import CodeGeneration, AITask
from services.ai_service import AIService
import json
import uuid

logger = logging.getLogger(__name__)
ai_service = AIService()


class CodeGeneratorService:
    """Service for AI-powered code generation"""

    def generate_frontend_component(
        self,
        description: str,
        framework: str = "react",
        style_system: str = "tailwind",
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate a React component from description

        Args:
            description: Natural language description of component
            framework: Frontend framework (react, vue, etc.)
            style_system: Styling system (tailwind, css, etc.)
            context: Additional context (existing components, design system)
        """
        try:
            prompt = f"""Generate a {framework} component with {style_system} styling.

Description: {description}

Requirements:
- Use functional components with hooks
- Follow React best practices
- Use TailwindCSS for styling (black/white aesthetic, spaced typography)
- Include proper TypeScript types if applicable
- Export as default export
- Add helpful comments

{self._build_context_prompt(context)}

Generate the complete component code."""

            response = ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are an expert React/TypeScript developer. Generate clean, production-ready component code following modern best practices.",
                temperature=0.7,
            )

            # Extract code from response (handle markdown code blocks)
            code = self._extract_code(response)

            # Create generation record
            generation_id = str(uuid.uuid4())
            with get_session() as session:
                generation = CodeGeneration(
                    generation_id=generation_id,
                    code_type="frontend",
                    language="javascript",
                    original_spec=description,
                    generated_code=code,
                    status="generated",
                    created_at=datetime.utcnow(),
                )
                session.add(generation)
                session.commit()

                # Create task record
                task = AITask(
                    task_id=str(uuid.uuid4()),
                    task_type="code_generation",
                    status="completed",
                    input_data=json.dumps(
                        {
                            "type": "frontend",
                            "description": description,
                            "framework": framework,
                        }
                    ),
                    output_data=json.dumps(
                        {
                            "generation_id": generation_id,
                            "code_length": len(code),
                        }
                    ),
                    completed_at=datetime.utcnow(),
                )
                session.add(task)
                session.commit()

            return {
                "success": True,
                "generation_id": generation_id,
                "code": code,
                "language": "javascript",
                "framework": framework,
            }
        except Exception as e:
            logger.error(f"Frontend code generation error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def generate_backend_endpoint(
        self, description: str, framework: str = "fastapi", context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a FastAPI endpoint from description

        Args:
            description: Natural language description of endpoint
            framework: Backend framework (fastapi, flask, etc.)
            context: Additional context (existing models, routes)
        """
        try:
            prompt = f"""Generate a {framework} API endpoint.

Description: {description}

Requirements:
- Use FastAPI best practices
- Include proper type hints
- Add docstrings
- Include error handling
- Use appropriate HTTP methods and status codes
- Include request/response models if needed

{self._build_context_prompt(context)}

Generate the complete endpoint code."""

            response = ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are an expert Python/FastAPI developer. Generate clean, production-ready API code following best practices and conventions.",
                temperature=0.7,
            )

            code = self._extract_code(response)

            generation_id = str(uuid.uuid4())
            with get_session() as session:
                generation = CodeGeneration(
                    generation_id=generation_id,
                    code_type="backend",
                    language="python",
                    original_spec=description,
                    generated_code=code,
                    status="generated",
                    created_at=datetime.utcnow(),
                )
                session.add(generation)
                session.commit()

                task = AITask(
                    task_id=str(uuid.uuid4()),
                    task_type="code_generation",
                    status="completed",
                    input_data=json.dumps(
                        {
                            "type": "backend",
                            "description": description,
                            "framework": framework,
                        }
                    ),
                    output_data=json.dumps(
                        {
                            "generation_id": generation_id,
                            "code_length": len(code),
                        }
                    ),
                    completed_at=datetime.utcnow(),
                )
                session.add(task)
                session.commit()

            return {
                "success": True,
                "generation_id": generation_id,
                "code": code,
                "language": "python",
                "framework": framework,
            }
        except Exception as e:
            logger.error(f"Backend code generation error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def optimize_code(self, code: str, language: str, optimization_type: str = "general") -> Dict[str, Any]:
        """
        Optimize existing code using AI

        Args:
            code: Code to optimize
            language: Programming language
            optimization_type: Type of optimization (performance, accessibility, readability)
        """
        try:
            prompt = f"""Optimize the following {language} code for {optimization_type}:

{code}

Provide:
1. Optimized code
2. Explanation of changes
3. Performance/quality improvements

Focus on: {optimization_type}"""

            response = ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are an expert code reviewer and optimizer. Provide optimized code with clear explanations.",
                temperature=0.5,
            )

            optimized_code = self._extract_code(response)

            return {
                "success": True,
                "original_code": code,
                "optimized_code": optimized_code,
                "explanation": response,
                "optimization_type": optimization_type,
            }
        except Exception as e:
            logger.error(f"Code optimization error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def _build_context_prompt(self, context: Optional[Dict[str, Any]]) -> str:
        """Build context string for code generation"""
        if not context:
            return ""

        context_parts = []
        if context.get("existing_components"):
            context_parts.append(f"Existing components: {context['existing_components']}")
        if context.get("design_system"):
            context_parts.append(f"Design system: {context['design_system']}")
        if context.get("dependencies"):
            context_parts.append(f"Dependencies: {context['dependencies']}")

        return "\n".join(context_parts) if context_parts else ""

    def _extract_code(self, response: str) -> str:
        """Extract code from AI response (handle markdown code blocks)"""
        # Try to extract code from markdown code blocks
        if "```" in response:
            parts = response.split("```")
            # Usually code is in odd-indexed parts after splitting
            for i in range(1, len(parts), 2):
                code = parts[i].strip()
                # Remove language identifier if present
                if "\n" in code:
                    lines = code.split("\n")
                    if lines[0] in ["javascript", "jsx", "typescript", "tsx", "python", "py"]:
                        code = "\n".join(lines[1:])
                    return code.strip()

        # If no code blocks, return entire response
        return response.strip()

    def get_generation(self, generation_id: str) -> Optional[CodeGeneration]:
        """Get a code generation record"""
        with get_session() as session:
            return session.exec(select(CodeGeneration).where(CodeGeneration.generation_id == generation_id)).first()

    def update_generation_status(
        self, generation_id: str, status: str, review_notes: Optional[str] = None, file_path: Optional[str] = None
    ) -> bool:
        """Update code generation status"""
        try:
            with get_session() as session:
                generation = session.exec(
                    select(CodeGeneration).where(CodeGeneration.generation_id == generation_id)
                ).first()

                if not generation:
                    return False

                generation.status = status
                if review_notes:
                    generation.review_notes = review_notes
                if file_path:
                    generation.file_path = file_path
                if status == "deployed":
                    generation.deployed_at = datetime.utcnow()

                session.add(generation)
                session.commit()
                return True
        except Exception as e:
            logger.error(f"Update generation status error: {e}")
            return False


# Global instance
code_generator_service = CodeGeneratorService()
