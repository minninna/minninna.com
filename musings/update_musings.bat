@echo off
setlocal enabledelayedexpansion
set "DIR=%~dp0"
set "DATA=%DIR%data"
set "OUT=%DIR%musings.js"
set "RENDER=%DIR%_render.js"

echo // AUTO-GENERATED — non modificare manualmente. > "%OUT%"
echo // Rigenera con doppio clic su update_musings.bat >> "%OUT%"
echo. >> "%OUT%"
echo const MUSINGS = [ >> "%OUT%"

set first=1
for /f "delims=" %%F in ('dir /b /o-n "%DATA%\*.txt" 2^>nul') do (
    set "fname=%%~nF"
    set "fdate=!fname:~0,8!"
    set "ftitle=!fname:~9!"

    :: Verifica che la data sia numerica
    set "chk=!fdate!"
    for /f "delims=0123456789" %%c in ("!chk!") do set "chk=bad"
    if not "!chk!"=="bad" (
        if !first!==0 ( echo , >> "%OUT%" )
        set first=0

        :: Leggi il file riga per riga, costruisci content con \n
        set "content="
        set "linecount=0"
        for /f "usebackq delims=" %%L in ("!DATA!\%%F") do (
            set "line=%%L"
            :: Escape backtick e dollaro
            set "line=!line:`=\`!"
            if !linecount!==0 (
                set "content=!line!"
            ) else (
                set "content=!content!\n!line!"
            )
            set /a linecount+=1
        )

        (
        echo   {
        echo     date: '!fdate!',
        echo     title: '!ftitle!',
        echo     content: `!content!`
        echo   }
        ) >> "%OUT%"
    )
)

echo ]; >> "%OUT%"
echo. >> "%OUT%"

:: Appendi _render.js verbatim
type "%RENDER%" >> "%OUT%"

echo.
echo Fatto.
timeout /t 2 >nul
