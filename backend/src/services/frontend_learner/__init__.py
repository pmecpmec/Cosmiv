"""
Frontend Learner Service
Self-learning front-end intelligence module for Cosmiv
"""

try:
    from .parser import PatternParser
    from .vectorizer import PatternVectorizer
    from .learner import PatternLearner
    
    __all__ = [
        "PatternParser",
        "PatternVectorizer",
        "PatternLearner",
    ]
except ImportError as e:
    # Handle missing optional dependencies gracefully
    import logging
    logger = logging.getLogger(__name__)
    logger.warning(f"Frontend learner dependencies not available: {e}")
    __all__ = []

