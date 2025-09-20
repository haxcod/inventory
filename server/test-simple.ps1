# Simple PowerShell API Test Script

Write-Host "🚀 Starting Simple API Tests..." -ForegroundColor Green
Write-Host "=" * 50

# Test Health Check
Write-Host "`n🏥 Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "✅ Health Check: PASSED" -ForegroundColor Green
    Write-Host "Response: $($healthResponse | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Test Login
Write-Host "`n🔐 Testing Authentication Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@company.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.data.token) {
        $global:authToken = $loginResponse.data.token
        Write-Host "✅ Login: PASSED" -ForegroundColor Green
        Write-Host "Token: $($global:authToken.Substring(0, 20))..."
    } else {
        Write-Host "❌ Login: FAILED" -ForegroundColor Red
        Write-Host "Response: $($loginResponse | ConvertTo-Json -Depth 2)"
    }
} catch {
    Write-Host "❌ Login: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Test Get Users (if we have a token)
if ($global:authToken) {
    Write-Host "`n👥 Testing Get Users..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
            "Content-Type" = "application/json"
        }
        $usersResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method GET -Headers $headers
        Write-Host "✅ Get Users: PASSED" -ForegroundColor Green
        Write-Host "Users Count: $($usersResponse.data.Count)"
    } catch {
        Write-Host "❌ Get Users: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Products
    Write-Host "`n📦 Testing Get Products..." -ForegroundColor Yellow
    try {
        $productsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET -Headers $headers
        Write-Host "✅ Get Products: PASSED" -ForegroundColor Green
        Write-Host "Products Count: $($productsResponse.data.Count)"
    } catch {
        Write-Host "❌ Get Products: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Branches
    Write-Host "`n🏢 Testing Get Branches..." -ForegroundColor Yellow
    try {
        $branchesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/branches" -Method GET -Headers $headers
        Write-Host "✅ Get Branches: PASSED" -ForegroundColor Green
        Write-Host "Branches Count: $($branchesResponse.data.Count)"
    } catch {
        Write-Host "❌ Get Branches: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Payments
    Write-Host "`n💳 Testing Get Payments..." -ForegroundColor Yellow
    try {
        $paymentsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method GET -Headers $headers
        Write-Host "✅ Get Payments: PASSED" -ForegroundColor Green
        Write-Host "Payments Count: $($paymentsResponse.data.Count)"
    } catch {
        Write-Host "❌ Get Payments: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Create Payment
    Write-Host "`n💰 Testing Create Payment..." -ForegroundColor Yellow
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
        Write-Host "✅ Create Payment: PASSED" -ForegroundColor Green
        Write-Host "Payment ID: $($createPaymentResponse.data._id)"
    } catch {
        Write-Host "❌ Create Payment: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Invoices
    Write-Host "`n📄 Testing Get Invoices..." -ForegroundColor Yellow
    try {
        $invoicesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/billing/invoices" -Method GET -Headers $headers
        Write-Host "✅ Get Invoices: PASSED" -ForegroundColor Green
        Write-Host "Invoices Count: $($invoicesResponse.data.Count)"
    } catch {
        Write-Host "❌ Get Invoices: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Dashboard
    Write-Host "`n📊 Testing Get Dashboard..." -ForegroundColor Yellow
    try {
        $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard" -Method GET -Headers $headers
        Write-Host "✅ Get Dashboard: PASSED" -ForegroundColor Green
        Write-Host "Dashboard data received successfully"
    } catch {
        Write-Host "❌ Get Dashboard: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Reports
    Write-Host "`n📈 Testing Get Reports..." -ForegroundColor Yellow
    try {
        $reportsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/reports" -Method GET -Headers $headers
        Write-Host "✅ Get Reports: PASSED" -ForegroundColor Green
        Write-Host "Reports data received successfully"
    } catch {
        Write-Host "❌ Get Reports: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
} else {
    Write-Host "`n⚠️  Skipping authenticated tests - no token available" -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 50
Write-Host "🎯 API Testing Complete!" -ForegroundColor Green
