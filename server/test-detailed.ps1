# Detailed API Test Script

Write-Host "Starting Detailed API Tests..." -ForegroundColor Green
Write-Host "=================================================="

# Test Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "PASS - Health Check" -ForegroundColor Green
    Write-Host "Status: $($healthResponse.status)"
} catch {
    Write-Host "FAIL - Health Check" -ForegroundColor Red
}

# Test Login and get token
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
        Write-Host "PASS - Login" -ForegroundColor Green
        Write-Host "User: $($global:user.name) ($($global:user.role))"
        Write-Host "Permissions: $($global:user.permissions -join ', ')"
    } else {
        Write-Host "FAIL - Login" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL - Login" -ForegroundColor Red
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
        Write-Host "PASS - Get Users" -ForegroundColor Green
        Write-Host "Users Count: $($usersResponse.data.Count)"
        if ($usersResponse.data.Count -gt 0) {
            Write-Host "First User: $($usersResponse.data[0].name) ($($usersResponse.data[0].role))"
        }
    } catch {
        Write-Host "FAIL - Get Users" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }

    # Test Get Products
    Write-Host "`n4. Testing Get Products..." -ForegroundColor Yellow
    try {
        $productsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET -Headers $headers
        Write-Host "PASS - Get Products" -ForegroundColor Green
        Write-Host "Products Count: $($productsResponse.data.Count)"
        if ($productsResponse.data.Count -gt 0) {
            Write-Host "First Product: $($productsResponse.data[0].name) - $($productsResponse.data[0].price)"
        }
    } catch {
        Write-Host "FAIL - Get Products" -ForegroundColor Red
    }

    # Test Get Branches
    Write-Host "`n5. Testing Get Branches..." -ForegroundColor Yellow
    try {
        $branchesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/branches" -Method GET -Headers $headers
        Write-Host "PASS - Get Branches" -ForegroundColor Green
        Write-Host "Branches Count: $($branchesResponse.data.Count)"
        if ($branchesResponse.data.Count -gt 0) {
            Write-Host "First Branch: $($branchesResponse.data[0].name)"
        }
    } catch {
        Write-Host "FAIL - Get Branches" -ForegroundColor Red
    }

    # Test Get Payments
    Write-Host "`n6. Testing Get Payments..." -ForegroundColor Yellow
    try {
        $paymentsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method GET -Headers $headers
        Write-Host "PASS - Get Payments" -ForegroundColor Green
        Write-Host "Payments Count: $($paymentsResponse.data.Count)"
        if ($paymentsResponse.data.Count -gt 0) {
            Write-Host "First Payment: $($paymentsResponse.data[0].description) - $($paymentsResponse.data[0].amount)"
        }
    } catch {
        Write-Host "FAIL - Get Payments" -ForegroundColor Red
    }

    # Test Create Payment with proper branch
    Write-Host "`n7. Testing Create Payment..." -ForegroundColor Yellow
    try {
        # First get a branch ID
        $branchesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/branches" -Method GET -Headers $headers
        $branchId = $branchesResponse.data[0]._id
        
        $paymentBody = @{
            amount = 5000
            paymentMethod = "upi"
            paymentType = "credit"
            description = "Test payment from PowerShell"
            reference = "TEST-PS-002"
            customer = "PowerShell Test Customer"
            notes = "Test payment created via PowerShell script"
            branch = $branchId
        } | ConvertTo-Json

        $createPaymentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method POST -Body $paymentBody -Headers $headers
        Write-Host "PASS - Create Payment" -ForegroundColor Green
        Write-Host "Payment ID: $($createPaymentResponse.data.payment._id)"
    } catch {
        Write-Host "FAIL - Create Payment" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Details: $errorBody"
        }
    }

    # Test Get Invoices
    Write-Host "`n8. Testing Get Invoices..." -ForegroundColor Yellow
    try {
        $invoicesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/billing/invoices" -Method GET -Headers $headers
        Write-Host "PASS - Get Invoices" -ForegroundColor Green
        Write-Host "Invoices Count: $($invoicesResponse.data.Count)"
        if ($invoicesResponse.data.Count -gt 0) {
            Write-Host "First Invoice: $($invoicesResponse.data[0].invoiceNumber) - $($invoicesResponse.data[0].total)"
        }
    } catch {
        Write-Host "FAIL - Get Invoices" -ForegroundColor Red
    }

    # Test Get Dashboard
    Write-Host "`n9. Testing Get Dashboard..." -ForegroundColor Yellow
    try {
        $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard" -Method GET -Headers $headers
        Write-Host "PASS - Get Dashboard" -ForegroundColor Green
        Write-Host "Dashboard data received successfully"
    } catch {
        Write-Host "FAIL - Get Dashboard" -ForegroundColor Red
    }

    # Test Specific Report Endpoints
    Write-Host "`n10. Testing Report Endpoints..." -ForegroundColor Yellow
    
    # Test Sales Report
    try {
        $salesReport = Invoke-RestMethod -Uri "http://localhost:5000/api/reports/sales" -Method GET -Headers $headers
        Write-Host "PASS - Sales Report" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - Sales Report" -ForegroundColor Red
    }

    # Test Stock Report
    try {
        $stockReport = Invoke-RestMethod -Uri "http://localhost:5000/api/reports/stock" -Method GET -Headers $headers
        Write-Host "PASS - Stock Report" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - Stock Report" -ForegroundColor Red
    }

    # Test Payment Report
    try {
        $paymentReport = Invoke-RestMethod -Uri "http://localhost:5000/api/reports/payments" -Method GET -Headers $headers
        Write-Host "PASS - Payment Report" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - Payment Report" -ForegroundColor Red
    }

    # Test Profit/Loss Report
    try {
        $profitLossReport = Invoke-RestMethod -Uri "http://localhost:5000/api/reports/profit-loss" -Method GET -Headers $headers
        Write-Host "PASS - Profit/Loss Report" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - Profit/Loss Report" -ForegroundColor Red
    }

} else {
    Write-Host "`nSkipping authenticated tests - no token available" -ForegroundColor Yellow
}

Write-Host "`n=================================================="
Write-Host "Detailed API Testing Complete!" -ForegroundColor Green
