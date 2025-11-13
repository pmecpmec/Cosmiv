"""
Caching utilities for Cosmiv API
Provides response caching and query result caching
"""

import json
import hashlib
from typing import Any, Optional, Callable
from functools import wraps
import redis
from config import settings
import logging

logger = logging.getLogger(__name__)

# Redis client (lazy initialization)
_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    """Get Redis client for caching"""
    global _redis_client
    
    if _redis_client is not None:
        return _redis_client
    
    try:
        if settings.REDIS_URL:
            _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            # Test connection
            _redis_client.ping()
            logger.info("Redis cache connected")
            return _redis_client
    except Exception as e:
        logger.warning(f"Redis cache unavailable: {e}")
        return None
    
    return None


def cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate cache key from prefix and arguments"""
    key_data = {
        "args": args,
        "kwargs": sorted(kwargs.items())
    }
    key_str = json.dumps(key_data, sort_keys=True)
    key_hash = hashlib.md5(key_str.encode()).hexdigest()
    return f"cache:{prefix}:{key_hash}"


def cached(
    ttl: int = 300,
    prefix: str = "default",
    key_func: Optional[Callable] = None,
):
    """
    Decorator to cache function results
    
    Args:
        ttl: Time to live in seconds (default: 5 minutes)
        prefix: Cache key prefix
        key_func: Optional function to generate cache key from arguments
    
    Example:
        @cached(ttl=600, prefix="user_stats")
        def get_user_stats(user_id: str):
            # Expensive computation
            return stats
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            client = get_redis_client()
            if not client:
                # No cache available, just call function
                return await func(*args, **kwargs)
            
            # Generate cache key
            if key_func:
                cache_key_str = key_func(*args, **kwargs)
            else:
                cache_key_str = cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            try:
                cached_value = client.get(cache_key_str)
                if cached_value:
                    logger.debug(f"Cache hit: {cache_key_str}")
                    return json.loads(cached_value)
            except Exception as e:
                logger.warning(f"Cache read error: {e}")
            
            # Cache miss, call function
            logger.debug(f"Cache miss: {cache_key_str}")
            result = await func(*args, **kwargs)
            
            # Store in cache
            try:
                client.setex(
                    cache_key_str,
                    ttl,
                    json.dumps(result, default=str)
                )
            except Exception as e:
                logger.warning(f"Cache write error: {e}")
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            client = get_redis_client()
            if not client:
                # No cache available, just call function
                return func(*args, **kwargs)
            
            # Generate cache key
            if key_func:
                cache_key_str = key_func(*args, **kwargs)
            else:
                cache_key_str = cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            try:
                cached_value = client.get(cache_key_str)
                if cached_value:
                    logger.debug(f"Cache hit: {cache_key_str}")
                    return json.loads(cached_value)
            except Exception as e:
                logger.warning(f"Cache read error: {e}")
            
            # Cache miss, call function
            logger.debug(f"Cache miss: {cache_key_str}")
            result = func(*args, **kwargs)
            
            # Store in cache
            try:
                client.setex(
                    cache_key_str,
                    ttl,
                    json.dumps(result, default=str)
                )
            except Exception as e:
                logger.warning(f"Cache write error: {e}")
            
            return result
        
        # Return appropriate wrapper based on function type
        import inspect
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


def invalidate_cache(pattern: str) -> int:
    """
    Invalidate cache entries matching pattern
    
    Args:
        pattern: Redis key pattern (e.g., "cache:user_stats:*")
    
    Returns:
        Number of keys deleted
    """
    client = get_redis_client()
    if not client:
        return 0
    
    try:
        keys = client.keys(pattern)
        if keys:
            return client.delete(*keys)
        return 0
    except Exception as e:
        logger.warning(f"Cache invalidation error: {e}")
        return 0


def clear_cache() -> int:
    """Clear all cache entries"""
    return invalidate_cache("cache:*")

