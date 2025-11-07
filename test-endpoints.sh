#!/bin/bash

# Script untuk manual testing endpoints
# Pastikan server sudah running dengan: npm run dev

echo "=========================================="
echo "Manual Testing Express N8N Backend"
echo "=========================================="
echo ""

# Base URL
BASE_URL="http://localhost:3001"

echo "1. Testing Health Check Endpoint"
echo "GET $BASE_URL/health"
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "=========================================="
echo ""

echo "2. Testing Chat Endpoint - Valid Payload"
echo "POST $BASE_URL/api/chat"
curl -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "message": "Hello, this is a test message",
    "userId": "test-user-123",
    "metadata": {
      "source": "manual-test",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "=========================================="
echo ""

echo "3. Testing Chat Endpoint - Invalid Payload (Empty Message)"
echo "POST $BASE_URL/api/chat"
curl -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "message": "",
    "userId": "test-user-123"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "=========================================="
echo ""

echo "4. Testing Chat Endpoint - Invalid Payload (Missing Message)"
echo "POST $BASE_URL/api/chat"
curl -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "userId": "test-user-123"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "=========================================="
echo ""

echo "5. Testing CORS - Unauthorized Origin"
echo "POST $BASE_URL/api/chat (from unauthorized origin)"
curl -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -H "Origin: http://unauthorized-domain.com" \
  -d '{
    "message": "Test from unauthorized origin"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "=========================================="
echo ""

echo "6. Testing Rate Limiting"
echo "Sending 65 requests rapidly to trigger rate limit..."
for i in {1..65}; do
  curl -s -X POST "$BASE_URL/api/chat" \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost:3000" \
    -d "{\"message\": \"Rate limit test $i\"}" \
    -w "Request $i - Status: %{http_code}\n" \
    -o /dev/null
done

echo ""
echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
