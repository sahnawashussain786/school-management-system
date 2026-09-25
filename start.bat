@echo off
echo Starting School Management System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul
