# Cache Implementation Summary

## Overview
Implemented response caching to reduce redundant N8N webhook calls for repeated questions.

## Architecture

### Flow Diagram
```
User Request
    ↓
ChatController.handleChatRequest()
    ↓
ChatService.processChat()
    ↓
CacheService.getCachedResponse()
    ↓
    ├─ Cache HIT → Return cached answer + Save to message history
    │                                    ↓
    │                              Return { output, fromCache: true }
    │
    └─ Cache MISS → forwardToN8n() → Get response from N8N
                         ↓
                    CacheService.saveCachedResponse()
                         ↓
                    Return { output, fromCache: false }
```

## Components Created

### 1. Database Layer
- **Model**: `CachedResponse` in `prisma/schema.prisma`
  - `questionHash` (unique) - SHA256 hash for fast lookup
  - `question` - Original question for debugging
  - `answer` - Response from N8N
  - `hitCount` - Usage metrics
  - `expiresAt` - TTL for cache expiration
  - `lastAccessedAt` - Last access timestamp

### 2. Utility Layer
- **File**: `src/utils/hashUtils.ts`
  - `generateQuestionHash()` - Normalizes and hashes questions
  - Normalization: lowercase, trim, remove extra spaces
  - Algorithm: SHA256

### 3. Repository Layer
- **File**: `src/repositories/CacheRepository.ts`
  - `findByHash()` - Find cached response
  - `create()` - Save new cache entry
  - `incrementHitCount()` - Update usage metrics
  - `deleteExpired()` - Cleanup expired cache

### 4. Service Layer
- **File**: `src/services/CacheService.ts`
  - `getCachedResponse()` - Check cache with expiration validation
  - `saveCachedResponse()` - Save response with TTL
  - `cleanupExpiredCache()` - Remove expired entries

- **Modified**: `src/services/ChatService.ts`
  - Added `processChat()` method with cache integration
  - Maintains backward compatibility with `forwardToN8n()`

### 5. Controller Layer
- **Modified**: `src/controllers/ChatController.ts`
  - Updated to use `processChat()` instead of `forwardToN8n()`

### 6. Configuration
- **Modified**: `src/config/env.ts`
  - Added `CACHE_TTL_HOURS` (default: 24 hours)
- **Modified**: `.env.example`
  - Added `CACHE_TTL_HOURS=24`

## Features

### Cache Key Strategy
- Questions are normalized before hashing
- "Apa itu AI?" = "apa itu ai?" = "Apa  itu  AI?" (same cache key)
- Case-insensitive and whitespace-normalized

### Cache Behavior
- **Cache Hit**: 
  - Returns cached answer immediately
  - Saves user message and cached answer to message history
  - Increments hit count
  - Response includes `fromCache: true`

- **Cache Miss**:
  - Forwards request to N8N webhook
  - Saves response to cache with TTL
  - Saves messages to history (handled by forwardToN8n)
  - Response includes `fromCache: false`

### TTL (Time To Live)
- Default: 24 hours (configurable via `CACHE_TTL_HOURS`)
- Expired cache entries are not returned
- Cleanup can be done via `cleanupExpiredCache()` method

## Benefits

1. **Performance**: Faster response for repeated questions
2. **Cost Reduction**: Fewer N8N webhook calls
3. **Scalability**: Reduces load on N8N service
4. **Metrics**: Track cache hit rate via `hitCount`
5. **Flexibility**: Configurable TTL per environment

## Testing

### Unit Test
Run: `npx ts-node test-cache.ts`

Tests:
- ✅ Hash generation and normalization
- ✅ Cache miss scenario
- ✅ Save to cache
- ✅ Cache hit scenario
- ✅ Cleanup expired cache

### Integration Test
See `test-chat-cache.md` for manual testing scenarios

## Database Migration

Migration applied via: `npx prisma db push`

Table created: `cached_responses`

## Configuration

Add to `.env`:
```env
CACHE_TTL_HOURS=24
```

## Monitoring

### Check Cache Statistics
```sql
SELECT 
  COUNT(*) as total_cached,
  SUM(hit_count) as total_hits,
  AVG(hit_count) as avg_hits_per_entry
FROM cached_responses;
```

### Top Cached Questions
```sql
SELECT 
  question,
  hit_count,
  created_at,
  expires_at
FROM cached_responses
ORDER BY hit_count DESC
LIMIT 10;
```

### Cache Hit Rate
Monitor logs for:
- `Cache hit` - Successful cache retrieval
- `Cache miss` - Cache not found or expired

## Future Enhancements

1. **Scheduled Cleanup**: Add cron job to clean expired cache
2. **Cache Invalidation**: Admin endpoint to clear specific cache
3. **LRU Eviction**: Implement Least Recently Used eviction if cache grows too large
4. **Cache Warming**: Pre-populate cache with common questions
5. **Analytics Dashboard**: Visualize cache hit rate and performance

## Notes

- Cache is global (not per session)
- Message history is still saved per session
- Cache failures don't break main flow (graceful degradation)
- All cache operations are logged for monitoring
