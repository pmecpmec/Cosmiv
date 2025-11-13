"""
Pattern Vectorizer for Frontend Learning
Creates embeddings for semantic search of design patterns
"""

import base64
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)


class PatternVectorizer:
    """
    Vectorizes design patterns for semantic search
    Uses sentence-transformers for embeddings
    Stores in ChromaDB or file-based cache
    """

    def __init__(
        self,
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        vector_db_path: str = "knowledge/embeddings",
        use_chromadb: bool = True,
    ):
        """
        Initialize the vectorizer

        Args:
            embedding_model: HuggingFace model name for embeddings
            vector_db_path: Path to store vector database
            use_chromadb: Whether to use ChromaDB (fallback to file-based if False)
        """
        self.embedding_model_name = embedding_model
        self.vector_db_path = Path(vector_db_path)
        self.vector_db_path.mkdir(parents=True, exist_ok=True)
        self.use_chromadb = use_chromadb

        # Initialize embedding model
        self.embedder = None
        self._initialize_embedder()

        # Initialize vector database
        self.vector_db = None
        self._initialize_vector_db()

    def _initialize_embedder(self):
        """Initialize the embedding model"""
        try:
            from sentence_transformers import SentenceTransformer

            self.embedder = SentenceTransformer(self.embedding_model_name)
            logger.info(f"✅ Initialized embedding model: {self.embedding_model_name}")
        except ImportError:
            logger.warning(
                "⚠️ sentence-transformers not installed, using mock embeddings. "
                "Install with: pip install sentence-transformers"
            )
            self.embedder = None
        except Exception as e:
            logger.error(f"Failed to initialize embedder: {e}")
            self.embedder = None

    def _initialize_vector_db(self):
        """Initialize ChromaDB or file-based vector store"""
        if self.use_chromadb:
            try:
                import chromadb
                from chromadb.config import Settings

                # Initialize ChromaDB client
                chroma_path = self.vector_db_path / "chroma_db"
                self.client = chromadb.PersistentClient(
                    path=str(chroma_path), settings=Settings(anonymized_telemetry=False)
                )

                # Get or create collection
                self.collection = self.client.get_or_create_collection(
                    name="frontend_patterns",
                    metadata={"description": "Frontend design patterns"},
                )

                logger.info("✅ Initialized ChromaDB vector database")
                self.vector_db = "chromadb"
            except ImportError:
                logger.warning(
                    "⚠️ ChromaDB not installed, using file-based storage. "
                    "Install with: pip install chromadb"
                )
                self.use_chromadb = False
                self._initialize_file_db()
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB: {e}")
                self.use_chromadb = False
                self._initialize_file_db()
        else:
            self._initialize_file_db()

    def _initialize_file_db(self):
        """Initialize file-based vector storage"""
        self.embeddings_file = self.vector_db_path / "embeddings.json"
        self.embeddings_cache: Dict[str, List[float]] = {}

        # Load existing embeddings
        if self.embeddings_file.exists():
            try:
                with open(self.embeddings_file, "r", encoding="utf-8") as f:
                    self.embeddings_cache = json.load(f)
                logger.info(f"Loaded {len(self.embeddings_cache)} cached embeddings")
            except Exception as e:
                logger.warning(f"Failed to load embeddings cache: {e}")

        self.vector_db = "file"

    def _create_text_representation(self, pattern_data: Dict[str, Any]) -> str:
        """Create text representation of pattern for embedding"""
        parts = []

        # URL
        if pattern_data.get("url"):
            parts.append(f"URL: {pattern_data['url']}")

        # Layout
        if pattern_data.get("layout"):
            parts.append(f"Layout: {pattern_data['layout']}")

        # Colors
        if pattern_data.get("colors"):
            colors_str = ", ".join(pattern_data["colors"][:10])  # Limit to 10
            parts.append(f"Colors: {colors_str}")

        # Fonts
        if pattern_data.get("fonts"):
            fonts_str = ", ".join(pattern_data["fonts"])
            parts.append(f"Fonts: {fonts_str}")

        # Components
        if pattern_data.get("components"):
            components_str = ", ".join(pattern_data["components"])
            parts.append(f"Components: {components_str}")

        # Animations
        if pattern_data.get("animations"):
            animations_str = ", ".join(pattern_data["animations"])
            parts.append(f"Animations: {animations_str}")

        # Gradients
        if pattern_data.get("gradients"):
            gradients_str = ", ".join(pattern_data["gradients"][:3])  # Limit to 3
            parts.append(f"Gradients: {gradients_str}")

        return " | ".join(parts)

    def _generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for text"""
        if not self.embedder:
            # Mock embedding (random vector)
            import random

            return [random.random() for _ in range(384)]  # Mock 384-dim vector

        try:
            embedding = self.embedder.encode(text, show_progress_bar=False)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            return None

    def vectorize_pattern(self, pattern_data: Dict[str, Any], pattern_id: str) -> Optional[List[float]]:
        """
        Vectorize a single pattern

        Args:
            pattern_data: Parsed pattern data
            pattern_id: Unique pattern identifier

        Returns:
            Embedding vector or None if failed
        """
        try:
            # Create text representation
            text = self._create_text_representation(pattern_data)

            # Generate embedding
            embedding = self._generate_embedding(text)

            if not embedding:
                return None

            # Store in vector database
            if self.vector_db == "chromadb":
                # Store in ChromaDB
                metadata = {
                    "url": pattern_data.get("url", ""),
                    "layout": pattern_data.get("layout", ""),
                    "pattern_id": pattern_id,
                }
                self.collection.add(
                    ids=[pattern_id],
                    embeddings=[embedding],
                    documents=[text],
                    metadatas=[metadata],
                )
            else:
                # Store in file cache
                self.embeddings_cache[pattern_id] = embedding
                self._save_embeddings_cache()

            return embedding
        except Exception as e:
            logger.error(f"Failed to vectorize pattern {pattern_id}: {e}")
            return None

    def _save_embeddings_cache(self):
        """Save embeddings cache to file"""
        try:
            with open(self.embeddings_file, "w", encoding="utf-8") as f:
                json.dump(self.embeddings_cache, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save embeddings cache: {e}")

    def search_similar(
        self, query: str, limit: int = 5, min_score: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Search for similar patterns using semantic search

        Args:
            query: Search query text
            limit: Maximum number of results
            min_score: Minimum similarity score

        Returns:
            List of similar patterns with scores
        """
        try:
            # Generate query embedding
            query_embedding = self._generate_embedding(query)
            if not query_embedding:
                return []

            if self.vector_db == "chromadb":
                # Search in ChromaDB
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=limit,
                )

                # Format results
                similar_patterns = []
                if results["ids"] and len(results["ids"][0]) > 0:
                    for i, pattern_id in enumerate(results["ids"][0]):
                        score = 1.0 - results["distances"][0][i]  # Convert distance to similarity
                        if score >= min_score:
                            similar_patterns.append(
                                {
                                    "pattern_id": pattern_id,
                                    "score": score,
                                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                                    "document": results["documents"][0][i] if results["documents"] else "",
                                }
                            )

                return similar_patterns
            else:
                # Search in file cache (simple cosine similarity)
                import numpy as np

                query_vec = np.array(query_embedding)
                similarities = []

                for pattern_id, embedding in self.embeddings_cache.items():
                    pattern_vec = np.array(embedding)
                    # Cosine similarity
                    similarity = np.dot(query_vec, pattern_vec) / (
                        np.linalg.norm(query_vec) * np.linalg.norm(pattern_vec)
                    )
                    if similarity >= min_score:
                        similarities.append(
                            {
                                "pattern_id": pattern_id,
                                "score": float(similarity),
                            }
                        )

                # Sort by score and return top results
                similarities.sort(key=lambda x: x["score"], reverse=True)
                return similarities[:limit]

        except Exception as e:
            logger.error(f"Failed to search similar patterns: {e}")
            return []

    def encode_embedding_base64(self, embedding: List[float]) -> str:
        """Encode embedding as base64 string for database storage"""
        import numpy as np

        arr = np.array(embedding, dtype=np.float32)
        return base64.b64encode(arr.tobytes()).decode("utf-8")

    def decode_embedding_base64(self, encoded: str) -> List[float]:
        """Decode base64 embedding string"""
        import numpy as np

        try:
            arr_bytes = base64.b64decode(encoded)
            arr = np.frombuffer(arr_bytes, dtype=np.float32)
            return arr.tolist()
        except Exception as e:
            logger.error(f"Failed to decode embedding: {e}")
            return []

