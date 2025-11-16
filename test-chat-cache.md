# Test Chat Cache Integration

## Prerequisites
1. Start the dev server: `npm run dev`
2. Make sure N8N_WEBHOOK_URL is configured in .env

## Test Scenarios

### Test 1: First Request (Cache Miss)
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"chatInput\":\"Apa itu AI?\",\"sessionId\":\"test-session-1\"}"
```

Expected:
- Response should have `"fromCache": false`
- N8N webhook is called
- Response is saved to cache

### Test 2: Second Request (Cache Hit)
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"chatInput\":\"Apa itu AI?\",\"sessionId\":\"test-session-2\"}"
```

Expected:
- Response should have `"fromCache": true`
- N8N webhook is NOT called
- Response is retrieved from cache
- Faster response time

### Test 3: Different Question (Cache Miss)
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"chatInput\":\"Jelaskan machine learning\",\"sessionId\":\"test-session-1\"}"
```

Expected:
- Response should have `"fromCache": false`
- N8N webhook is called

### Test 4: Same Question Different Case (Cache Hit)
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"chatInput\":\"apa itu ai?\",\"sessionId\":\"test-session-3\"}"
```

Expected:
- Response should have `"fromCache": true`
- Same answer as Test 1 (case-insensitive)

## Verify in Database

Check cached responses:
```sql
SELECT 
  question, 
  LEFT(answer, 50) as answer_preview,
  hit_count,
  created_at,
  expires_at
FROM cached_responses
ORDER BY created_at DESC;
```

Check message history:
```sql
SELECT 
  s.session_id,
  m.role,
  LEFT(m.content, 50) as content_preview,
  m.created_at
FROM messages m
JOIN sessions s ON m.session_id = s.id
WHERE s.session_id IN ('test-session-1', 'test-session-2', 'test-session-3')
ORDER BY m.created_at;
```

## Expected Behavior

1. ✅ Cache reduces N8N calls for repeated questions
2. ✅ Each session still has complete message history
3. ✅ Case-insensitive and whitespace-normalized caching
4. ✅ Response includes `fromCache` flag
5. ✅ Cache hit count increments on each use
