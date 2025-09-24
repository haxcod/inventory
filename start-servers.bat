@echo off
echo Starting Inventory Management System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d D:\Contract@2025\project\vite-inventory\server && npm start"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d D:\Contract@2025\project\vite-inventory\client && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
