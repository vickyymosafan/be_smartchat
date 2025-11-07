# Script untuk manual testing endpoints
# Pastikan server sudah running dengan: npm run dev

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Manual Testing Express N8N Backend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Base URL
$BASE_URL = "http://localhost:3001"

# Test 1: Health Check
Write-Host "1. Testing Health Check Endpoint" -ForegroundColor Yellow
Write-Host "GET $BASE_URL/health"
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -Method GET -ContentType "application/json"
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 2: Valid Chat Request
Write-Host "2. Testing Chat Endpoint - Valid Payload" -ForegroundColor Yellow
Write-Host "POST $BASE_URL/api/chat"
$validPayload = @{
    message = "Hello, this is a test message"
    userId = "test-user-123"
    metadata = @{
        source = "manual-test"
        timestamp = "2024-01-01T00:00:00Z"
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/chat" -Method POST -ContentType "application/json" -Body $validPayload -Headers @{"Origin"="http://localhost:3000"}
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 3: Invalid Payload - Empty Message
Write-Host "3. Testing Chat Endpoint - Invalid Payload (Empty Message)" -ForegroundColor Yellow
Write-Host "POST $BASE_URL/api/chat"
$invalidPayload1 = @{
    message = ""
    userId = "test-user-123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/chat" -Method POST -ContentType "application/json" -Body $invalidPayload1 -Headers @{"Origin"="http://localhost:3000"}
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Expected Error (400):" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 4: Invalid Payload - Missing Message
Write-Host "4. Testing Chat Endpoint - Invalid Payload (Missing Message)" -ForegroundColor Yellow
Write-Host "POST $BASE_URL/api/chat"
$invalidPayload2 = @{
    userId = "test-user-123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/chat" -Method POST -ContentType "application/json" -Body $invalidPayload2 -Headers @{"Origin"="http://localhost:3000"}
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Expected Error (400):" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 5: CORS - Unauthorized Origin
Write-Host "5. Testing CORS - Unauthorized Origin" -ForegroundColor Yellow
Write-Host "POST $BASE_URL/api/chat (from unauthorized origin)"
$corsPayload = @{
    message = "Test from unauthorized origin"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/chat" -Method POST -ContentType "application/json" -Body $corsPayload -Headers @{"Origin"="http://unauthorized-domain.com"}
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Expected CORS Error:" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 6: Rate Limiting
Write-Host "6. Testing Rate Limiting" -ForegroundColor Yellow
Write-Host "Sending 65 requests rapidly to trigger rate limit..."
$rateLimitPayload = @{
    message = "Rate limit test"
} | ConvertTo-Json

for ($i = 1; $i -le 65; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/chat" -Method POST -ContentType "application/json" -Body $rateLimitPayload -Headers @{"Origin"="http://localhost:3000"} -ErrorAction SilentlyContinue
        Write-Host "Request $i - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            Write-Host "Request $i - Status: 429 (Rate Limited)" -ForegroundColor Yellow
        } else {
            Write-Host "Request $i - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
