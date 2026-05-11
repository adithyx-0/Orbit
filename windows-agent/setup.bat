@echo off
title Prosit Agent — Setup
echo.
echo  ===================================
echo   Prosit Windows Agent — Setup
echo  ===================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Python not found. Download from https://python.org
    pause
    exit /b 1
)

echo  [1/4] Creating virtual environment...
python -m venv .venv
if errorlevel 1 ( echo  ERROR: venv creation failed & pause & exit /b 1 )

echo  [2/4] Installing dependencies...
.venv\Scripts\pip install --quiet -r requirements.txt
if errorlevel 1 ( echo  ERROR: pip install failed & pause & exit /b 1 )

echo  [3/4] Checking .env config...
if not exist .env (
    copy .env.example .env >nul
    echo  Created .env from template — please open it and fill in your credentials.
    notepad .env
) else (
    echo  .env already exists — skipping.
)

echo  [4/4] Checking categories.json...
if not exist categories.json (
    if exist categories.json.example (
        copy categories.json.example categories.json >nul
        echo  Created categories.json from example.
    )
) else (
    echo  categories.json already exists — skipping.
)

echo.
echo  ===================================
echo   Setup complete!
echo  ===================================
echo.
echo  To start the agent:   run.bat
echo  To add to startup:    install_startup.bat
echo.
pause
