@echo off
echo ========================================
echo  Running Django Migration for session_id
echo ========================================
echo.
cd /d "%~dp0backend\Backendcode"
echo Current directory: %CD%
echo.
echo Running: python manage.py migrate orders
call "%~dp0backend\.venv\Scripts\activate.bat"
python manage.py migrate orders
echo.
echo ========================================
echo  Migration complete! Restart your server.
echo ========================================
echo.
pause
