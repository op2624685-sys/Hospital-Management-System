package com.hms.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NoFailCacheErrorHandler implements CacheErrorHandler {

    @Override
    public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
        log.debug("Ignoring cache GET error. cache={}, key={}, cause={}", cacheName(cache), key, exception.toString());
    }

    @Override
    public void handleCachePutError(RuntimeException exception, Cache cache, Object key, @Nullable Object value) {
        log.debug("Ignoring cache PUT error. cache={}, key={}, cause={}", cacheName(cache), key, exception.toString());
    }

    @Override
    public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
        log.warn("Cache EVICT failed. cache={}, key={}, cause={}", cacheName(cache), key, exception.toString());
    }

    @Override
    public void handleCacheClearError(RuntimeException exception, Cache cache) {
        log.warn("Cache CLEAR failed. cache={}, cause={}", cacheName(cache), exception.toString());
    }

    private String cacheName(@Nullable Cache cache) {
        return cache == null ? "unknown" : cache.getName();
    }
}
