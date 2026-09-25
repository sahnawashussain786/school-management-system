@echo off
echo Starting School Management System (Single Window)...
echo.

echo Starting Backend Server...
cd backend
start /B npm run dev
cd ..

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
cd frontend
start /B npm run dev
cd ..

echo.
echo Both servers are running:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers.
pause
