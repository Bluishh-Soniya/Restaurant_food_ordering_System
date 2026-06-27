@echo off
echo ============================================
echo   Fixing PostgreSQL 18 - RestroScan Project
echo ============================================
echo.

echo [Step 1] Deleting stale postmaster.pid...
del "C:\Program Files\PostgreSQL\18\data\postmaster.pid" 2>nul
echo Done.
echo.

echo [Step 2] Starting PostgreSQL service...
net start postgresql-x64-18
echo.

echo [Step 3] Checking if port 5432 is listening...
timeout /t 3 /nobreak >nul
netstat -an | findstr "5432"
echo.

echo ============================================
echo   If you see LISTENING on 5432 above, 
echo   PostgreSQL is running!
echo ============================================
pause
