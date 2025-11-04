@echo off
echo ========================================
echo FinMate Admin Dashboard Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Checking Node.js version...
node --version
echo.

echo [2/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo [3/5] Checking for .env file...
if not exist .env (
    echo [WARN] .env file not found. Creating from template...
    copy .env.example .env
    echo.
    echo ========================================
    echo IMPORTANT: Configure your .env file!
    echo ========================================
    echo Please edit .env and add your Supabase credentials:
    echo   - REACT_APP_SUPABASE_URL
    echo   - REACT_APP_SUPABASE_ANON_KEY
    echo.
    echo Press any key to open .env file...
    pause >nul
    notepad .env
) else (
    echo .env file found!
)
echo.

echo [4/5] Setup checklist
echo ========================================
echo Please ensure you have completed:
echo   [?] Created .env file with Supabase credentials
echo   [?] Run database.sql in Supabase SQL Editor
echo   [?] Created admin user in Supabase Auth
echo   [?] Set is_admin = true for admin user
echo   [?] Enabled real-time replication
echo.
set /p CONTINUE="Have you completed all steps above? (y/n): "
if /i not "%CONTINUE%"=="y" (
    echo.
    echo Please complete the setup steps first!
    echo Refer to QUICKSTART.md for detailed instructions.
    pause
    exit /b 0
)
echo.

echo [5/5] Starting development server...
echo ========================================
echo Dashboard will open at http://localhost:3000
echo Press Ctrl+C to stop the server
echo ========================================
echo.
call npm start

pause
