@echo off
echo.
echo ================================================
echo        ArtHub Platform Setup Assistant
echo ================================================
echo.
echo This script will help you set up the ArtHub platform.
echo.

:check_node
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

:check_npm
echo Checking for npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available.
    pause
    exit /b 1
)
echo ✓ npm found
echo.

:install_frontend_deps
echo Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

:install_backend_deps
echo Installing backend dependencies...
cd ../backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
echo.

:compile_backend
echo Compiling backend TypeScript...
npx tsc
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile backend
    pause
    exit /b 1
)
echo ✓ Backend compiled successfully
echo.

echo ================================================
echo Setup complete!
echo.
echo To run the application:
echo 1. Make sure MongoDB and PostgreSQL are running
echo 2. Start the backend: cd backend && node dist/server.js
echo 3. Start the frontend: cd frontend && npm run dev
echo.
echo For more details, see README.md
echo ================================================
pause