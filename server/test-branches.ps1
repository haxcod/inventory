# Test Branch API

Write-Host "Testing Branch API..." -ForegroundColor Green

# Login first
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@company.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.data.token) {
        $authToken = $loginResponse.data.token
        Write-Host "PASS - Login successful" -ForegroundColor Green
    } else {
        Write-Host "FAIL - Login failed" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "FAIL - Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test branch API
Write-Host "`n2. Testing branch API..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $authToken"
        "Content-Type" = "application/json"
    }
    
    $branchesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/branches" -Method GET -Headers $headers
    Write-Host "PASS - Branch API call successful" -ForegroundColor Green
    Write-Host "Response: $($branchesResponse | ConvertTo-Json -Depth 3)"
    
    if ($branchesResponse.success -and $branchesResponse.data) {
        Write-Host "Branches Count: $($branchesResponse.data.Count)"
        if ($branchesResponse.data.Count -gt 0) {
            Write-Host "First Branch: $($branchesResponse.data[0].name)"
        }
    } else {
        Write-Host "No data in response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAIL - Branch API error" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Details: $errorBody"
    }
}

Write-Host "`nBranch test complete!" -ForegroundColor Green
