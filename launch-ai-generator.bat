@echo off
title AI Business Automation - Quotation & Invoice Generator
color 0B

echo.
echo ========================================
echo   AI BUSINESS AUTOMATION GENERATOR
echo ========================================
echo.
echo   Powered by Google Gemini 3.2
echo.
echo ========================================
echo.

echo [1] Starting local server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [+] Python detected - Starting server on port 8000
    echo.
    echo [i] Open your browser and go to:
    echo     http://localhost:8000/ai-generator.html
    echo.
    echo [i] Press Ctrl+C to stop the server
    echo.
    start http://localhost:8000/ai-generator.html
    python -m http.server 8000
) else (
    REM Check if Node.js is available
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [+] Node.js detected - Installing serve...
        call npx -y serve -l 8000
    ) else (
        echo [-] Neither Python nor Node.js found
        echo.
        echo [i] Opening file directly in browser...
        echo.
        start ai-generator.html
        echo.
        echo [!] For best experience, install Python or Node.js
        echo.
        pause
    )
)
