@echo off
setlocal
set "DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%DIR%update_musings.ps1"
if errorlevel 1 (
  echo.
  echo ERRORE: musings.js non generato.
  pause
  exit /b 1
)
echo.
echo Fatto.
timeout /t 2 >nul
