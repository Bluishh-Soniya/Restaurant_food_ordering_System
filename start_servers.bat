@echo off
echo =======================================================
echo Starting RestroScan Servers (Backend & Frontend)
echo =======================================================

echo.
echo [1/2] Starting Django Backend Server on port 8000...
start "RestroScan Backend" cmd /k "cd backend & call .venv\Scripts\activate & cd Backendcode & python manage.py runserver"

echo.
echo [2/2] Starting React Frontend Server...
start "RestroScan Frontend" cmd /k "cd frontend & npm start"

echo.
echo =======================================================
echo Both servers are starting in separate windows.
echo Please keep those windows open while using the app.
echo The UI network error should now be resolved!
echo =======================================================
pause
