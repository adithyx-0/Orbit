@echo off
title Prosit Agent — Install Startup Task
echo.
echo  Registering Prosit Agent to run at Windows login...
echo  (requires Administrator rights)
echo.

set AGENT_DIR=%~dp0
set TASK_NAME=PrositWindowsAgent
set RUN_BAT=%AGENT_DIR%run.bat

:: Delete existing task if present
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

:: Create task: run at logon, in background (hidden window), with highest privileges
schtasks /create ^
  /tn "%TASK_NAME%" ^
  /tr "\"%RUN_BAT%\"" ^
  /sc ONLOGON ^
  /rl HIGHEST ^
  /f ^
  /it >nul

if errorlevel 1 (
    echo  ERROR: Could not create task. Try running this script as Administrator.
    pause
    exit /b 1
)

echo  SUCCESS — Prosit Agent will now start automatically at login.
echo.
echo  To remove:   schtasks /delete /tn PrositWindowsAgent /f
echo.
pause
