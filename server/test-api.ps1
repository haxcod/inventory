# Simple PowerShell API Test Script

Write-Host "Starting API Tests..." -ForegroundColor Green
Write-Host "=================================================="

# Test Health Check
Write-Host "`nTesting Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "PASS - Health Check" -ForegroundColor Green
    Write-Host "Status: $($healthResponse.status)"
    Write-Host "Uptime: $($healthResponse.uptime)"
} catch {
    Write-Host "FAIL - Health Check" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Test Login
Write-Host "`nTesting Authentication Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@company.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.data.token) {
        $global:authToken = $loginResponse.data.token
        Write-Host "PASS - Login" -ForegroundColor Green
        Write-Host "User: $($loginResponse.data.user.name)"
        Write-Host "Role: $($loginResponse.data.user.role)"
    } else {
        Write-Host "FAIL - Login" -ForegroundColor Red
        Write-Host "Response: $($loginResponse | ConvertTo-Json -Depth 2)"
    }
} catch {
    Write-Host "FAIL - Login" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Test Get Users (if we have a token)
if ($global:authToken) {
    Write-Host "`nTesting Get Users..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
            "Content-Type" = "application/json"
        }
        $usersResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method GET -Headers $headers
        Write-Host "PASS - Get Users" -ForegroundColor Green
        Write-Host "Users Count: $($usersResponse.data.Count)"
    } catch {
        Write-Host "FAIL - Get Users" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Products
    Write-Host "`nTesting Get Products..." -ForegroundColor Yellow
    try {
        $productsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET -Headers $headers
        Write-Host "PASS - Get Products" -ForegroundColor Green
        Write-Host "Products Count: $($productsResponse.data.Count)"
    } catch {
        Write-Host "FAIL - Get Products" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Branches
    Write-Host "`nTesting Get Branches..." -ForegroundColor Yellow
    try {
        $branchesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/branches" -Method GET -Headers $headers
        Write-Host "PASS - Get Branches" -ForegroundColor Green
        Write-Host "Branches Count: $($branchesResponse.data.Count)"
    } catch {
        Write-Host "FAIL - Get Branches" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Payments
    Write-Host "`nTesting Get Payments..." -ForegroundColor Yellow
    try {
        $paymentsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method GET -Headers $headers
        Write-Host "PASS - Get Payments" -ForegroundColor Green
        Write-Host "Payments Count: $($paymentsResponse.data.Count)"
    } catch {
        Write-Host "FAIL - Get Payments" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Create Payment
    Write-Host "`nTesting Create Payment..." -ForegroundColor Yellow
    try {
        $paymentBody = @{
            amount = 5000
            paymentMethod = "upi"
            paymentType = "credit"
            description = "Test payment from PowerShell"
            reference = "TEST-PS-001"
            customer = "PowerShell Test Customer"
            notes = "Test payment created via PowerShell script"
        } | ConvertTo-Json

        $createPaymentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method POST -Body $paymentBody -Headers $headers
        Write-Host "PASS - Create Payment" -ForegroundColor Green
        Write-Host "Payment ID: $($createPaymentResponse.data._id)"
    } catch {
        Write-Host "FAIL - Create Payment" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Invoices
    Write-Host "`nTesting Get Invoices..." -ForegroundColor Yellow
    try {
        $invoicesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/billing/invoices" -Method GET -Headers $headers
        Write-Host "PASS - Get Invoices" -ForegroundColor Green
        Write-Host "Invoices Count: $($invoicesResponse.data.Count)"
    } catch {
        Write-Host "FAIL - Get Invoices" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Dashboard
    Write-Host "`nTesting Get Dashboard..." -ForegroundColor Yellow
    try {
        $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard" -Method GET -Headers $headers
        Write-Host "PASS - Get Dashboard" -ForegroundColor Green
        Write-Host "Dashboard data received successfully"
    } catch {
        Write-Host "FAIL - Get Dashboard" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Reports
    Write-Host "`nTesting Get Reports..." -ForegroundColor Yellow
    try {
        $reportsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/reports" -Method GET -Headers $headers
        Write-Host "PASS - Get Reports" -ForegroundColor Green
        Write-Host "Reports data received successfully"
    } catch {
        Write-Host "FAIL - Get Reports" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
} else {
    Write-Host "`nSkipping authenticated tests - no token available" -ForegroundColor Yellow
}

Write-Host "`n=================================================="
Write-Host "API Testing Complete!" -ForegroundColor Green
