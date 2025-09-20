# Final Comprehensive API Test

Write-Host "🚀 Final Comprehensive API Test" -ForegroundColor Green
Write-Host "=================================================="

$testResults = @()

# Test Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "✅ PASS - Health Check" -ForegroundColor Green
    $testResults += "Health Check: PASS"
} catch {
    Write-Host "❌ FAIL - Health Check" -ForegroundColor Red
    $testResults += "Health Check: FAIL"
}

# Test Login
Write-Host "`n2. Testing Authentication..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@company.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.data.token) {
        $global:authToken = $loginResponse.data.token
        $global:user = $loginResponse.data.user
        Write-Host "✅ PASS - Login" -ForegroundColor Green
        Write-Host "   User: $($global:user.name) ($($global:user.role))"
        $testResults += "Authentication: PASS"
    } else {
        Write-Host "❌ FAIL - Login" -ForegroundColor Red
        $testResults += "Authentication: FAIL"
    }
} catch {
    Write-Host "❌ FAIL - Login" -ForegroundColor Red
    $testResults += "Authentication: FAIL"
}

if ($global:authToken) {
    $headers = @{
        "Authorization" = "Bearer $global:authToken"
        "Content-Type" = "application/json"
    }

    # Test Get Users
    Write-Host "`n3. Testing Get Users..." -ForegroundColor Yellow
    try {
        $usersResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method GET -Headers $headers
        Write-Host "✅ PASS - Get Users" -ForegroundColor Green
        Write-Host "   Users Count: $($usersResponse.data.Count)"
        $testResults += "Get Users: PASS"
    } catch {
        Write-Host "❌ FAIL - Get Users" -ForegroundColor Red
        $testResults += "Get Users: FAIL"
    }

    # Test Get Products
    Write-Host "`n4. Testing Get Products..." -ForegroundColor Yellow
    try {
        $productsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET -Headers $headers
        Write-Host "✅ PASS - Get Products" -ForegroundColor Green
        Write-Host "   Products Count: $($productsResponse.data.Count)"
        $testResults += "Get Products: PASS"
    } catch {
        Write-Host "❌ FAIL - Get Products" -ForegroundColor Red
        $testResults += "Get Products: FAIL"
    }

    # Test Get Branches
    Write-Host "`n5. Testing Get Branches..." -ForegroundColor Yellow
    try {
        $branchesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/branches" -Method GET -Headers $headers
        Write-Host "✅ PASS - Get Branches" -ForegroundColor Green
        Write-Host "   Branches Count: $($branchesResponse.data.branches.Count)"
        $testResults += "Get Branches: PASS"
    } catch {
        Write-Host "❌ FAIL - Get Branches" -ForegroundColor Red
        $testResults += "Get Branches: FAIL"
    }

    # Test Get Payments
    Write-Host "`n6. Testing Get Payments..." -ForegroundColor Yellow
    try {
        $paymentsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method GET -Headers $headers
        Write-Host "✅ PASS - Get Payments" -ForegroundColor Green
        Write-Host "   Payments Count: $($paymentsResponse.data.Count)"
        $testResults += "Get Payments: PASS"
    } catch {
        Write-Host "❌ FAIL - Get Payments" -ForegroundColor Red
        $testResults += "Get Payments: FAIL"
    }

    # Test Create Payment
    Write-Host "`n7. Testing Create Payment..." -ForegroundColor Yellow
    try {
        $branchId = $branchesResponse.data.branches[0]._id
        $paymentBody = @{
            amount = 2500
            paymentMethod = "upi"
            paymentType = "credit"
            description = "Final test payment"
            reference = "FINAL-TEST-001"
            customer = "Final Test Customer"
            notes = "Payment created during final API test"
            branch = $branchId
        } | ConvertTo-Json

        $createPaymentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method POST -Body $paymentBody -Headers $headers
        Write-Host "✅ PASS - Create Payment" -ForegroundColor Green
        Write-Host "   Payment ID: $($createPaymentResponse.data.payment._id)"
        Write-Host "   Amount: $($createPaymentResponse.data.payment.amount)"
        $testResults += "Create Payment: PASS"
    } catch {
        Write-Host "❌ FAIL - Create Payment" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)"
        $testResults += "Create Payment: FAIL"
    }

    # Test Get Invoices
    Write-Host "`n8. Testing Get Invoices..." -ForegroundColor Yellow
    try {
        $invoicesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/billing/invoices" -Method GET -Headers $headers
        Write-Host "✅ PASS - Get Invoices" -ForegroundColor Green
        Write-Host "   Invoices Count: $($invoicesResponse.data.Count)"
        $testResults += "Get Invoices: PASS"
    } catch {
        Write-Host "❌ FAIL - Get Invoices" -ForegroundColor Red
        $testResults += "Get Invoices: FAIL"
    }

    # Test Get Dashboard
    Write-Host "`n9. Testing Get Dashboard..." -ForegroundColor Yellow
    try {
        $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard" -Method GET -Headers $headers
        Write-Host "✅ PASS - Get Dashboard" -ForegroundColor Green
        Write-Host "   Dashboard data received successfully"
        $testResults += "Get Dashboard: PASS"
    } catch {
        Write-Host "❌ FAIL - Get Dashboard" -ForegroundColor Red
        $testResults += "Get Dashboard: FAIL"
    }

    # Test Report Endpoints
    Write-Host "`n10. Testing Report Endpoints..." -ForegroundColor Yellow
    $reportTests = @(
        @{Name="Sales Report"; Url="/api/reports/sales"},
        @{Name="Stock Report"; Url="/api/reports/stock"},
        @{Name="Payment Report"; Url="/api/reports/payments"},
        @{Name="Profit/Loss Report"; Url="/api/reports/profit-loss"}
    )
    
    $reportPassCount = 0
    foreach ($reportTest in $reportTests) {
        try {
            $reportResponse = Invoke-RestMethod -Uri "http://localhost:5000$($reportTest.Url)" -Method GET -Headers $headers
            Write-Host "   ✅ $($reportTest.Name)" -ForegroundColor Green
            $reportPassCount++
        } catch {
            Write-Host "   ❌ $($reportTest.Name)" -ForegroundColor Red
        }
    }
    
    if ($reportPassCount -eq $reportTests.Count) {
        Write-Host "✅ PASS - All Report Endpoints" -ForegroundColor Green
        $testResults += "Report Endpoints: PASS"
    } else {
        Write-Host "❌ FAIL - Some Report Endpoints" -ForegroundColor Red
        $testResults += "Report Endpoints: FAIL"
    }

} else {
    Write-Host "`n⚠️  Skipping authenticated tests - no token available" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=================================================="
Write-Host "📊 Test Summary" -ForegroundColor Green
Write-Host "=================================================="

$passCount = 0
$totalCount = $testResults.Count

foreach ($result in $testResults) {
    if ($result -like "*PASS*") {
        Write-Host "✅ $result" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "❌ $result" -ForegroundColor Red
    }
}

Write-Host "`n=================================================="
Write-Host "🎯 Overall Result: $passCount/$totalCount tests passed" -ForegroundColor Cyan
Write-Host "📈 Success Rate: $([math]::Round(($passCount / $totalCount) * 100, 1))%" -ForegroundColor Cyan

if ($passCount -eq $totalCount) {
    Write-Host "🎉 All APIs are working perfectly!" -ForegroundColor Green
} elseif ($passCount -gt ($totalCount * 0.8)) {
    Write-Host "✅ Most APIs are working well!" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Some APIs need attention" -ForegroundColor Red
}

Write-Host "`n=================================================="
