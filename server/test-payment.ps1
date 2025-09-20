# Test Payment Creation

Write-Host "Testing Payment Creation..." -ForegroundColor Green

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

# Get branches to get a valid branch ID
Write-Host "`n2. Getting branches..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $authToken"
        "Content-Type" = "application/json"
    }
    
    $branchesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/branches" -Method GET -Headers $headers
    Write-Host "PASS - Got branches" -ForegroundColor Green
    Write-Host "Branches Count: $($branchesResponse.data.branches.Count)"
    
    if ($branchesResponse.data.branches.Count -gt 0) {
        $branchId = $branchesResponse.data.branches[0]._id
        Write-Host "Using Branch ID: $branchId"
    } else {
        Write-Host "No branches found!" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "FAIL - Get branches error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test payment creation with minimal data
Write-Host "`n3. Testing payment creation..." -ForegroundColor Yellow
try {
    $paymentBody = @{
        amount = 1000
        paymentMethod = "cash"
        paymentType = "credit"
        description = "Simple test payment"
        customer = "Test Customer"
        branch = $branchId
    } | ConvertTo-Json

    Write-Host "Payment Body: $paymentBody"

    $createPaymentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method POST -Body $paymentBody -Headers $headers
    Write-Host "PASS - Payment created successfully" -ForegroundColor Green
    Write-Host "Payment ID: $($createPaymentResponse.data.payment._id)"
    Write-Host "Amount: $($createPaymentResponse.data.payment.amount)"
} catch {
    Write-Host "FAIL - Payment creation error" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Details: $errorBody"
    }
}

Write-Host "`nPayment test complete!" -ForegroundColor Green
