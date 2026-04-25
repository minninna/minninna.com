@echo off
:: ── update_musings.bat ─────────────────────────────────────
:: Legge tutti i .txt in .\data\ e riscrive musings.js
:: Naming convention: YYYYMMDD titolo del musing.txt
:: Doppio clic per aggiornare.

setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "DATA_DIR=%SCRIPT_DIR%data"
set "OUTPUT=%SCRIPT_DIR%musings.js"
set "TMPFILE=%SCRIPT_DIR%_tmp_musings.js"

:: Conta i file
set count=0
for %%f in ("%DATA_DIR%\*.txt") do set /a count+=1

echo Trovati %count% musings in data\

:: Scrivi header JS
(
echo // AUTO-GENERATED — non modificare manualmente.
echo // Rigenera con doppio clic su update_musings.bat
echo.
echo const MUSINGS = [
) > "%OUTPUT%"

set first=true
set idx=0

:: Itera file in ordine inverso (più recenti prima)
for /f "delims=" %%f in ('dir /b /o-n "%DATA_DIR%\*.txt" 2^>nul') do (
    set "fname=%%~nf"
    set "fpath=%DATA_DIR%\%%f"
    
    :: Estrai data (primi 8 chars) e titolo (resto)
    set "fdate=!fname:~0,8!"
    set "ftitle=!fname:~9!"
    
    :: Verifica che sia un numero (data valida)
    set "checkdate=!fdate!"
    for /f "delims=0123456789" %%c in ("!checkdate!") do set "checkdate=bad"
    if not "!checkdate!"=="bad" (
        if not "!first!"=="true" (
            echo , >> "%OUTPUT%"
        )
        set first=false
        
        :: Leggi contenuto file
        set "content="
        for /f "usebackq delims=" %%l in ("!fpath!") do (
            if defined content (
                set "content=!content!\n%%l"
            ) else (
                set "content=%%l"
            )
        )
        
        (
        echo   {
        echo     date: '!fdate!',
        echo     title: '!ftitle!',
        echo     content: `!content!`
        echo   }
        ) >> "%OUTPUT%"
    )
)

:: Footer JS
(
echo ];
echo.
echo function renderMusings^(^) {
echo   const list   = document.getElementById^('musingsList'^);
echo   const loader = document.getElementById^('loadingState'^);
echo   const sorted = [...MUSINGS].sort^(^(a, b^) =^> b.date.localeCompare^(a.date^)^);
echo   loader.remove^(^);
echo   sorted.forEach^(^(m, i^) =^> {
echo     const y = m.date.slice^(0,4^), mo = m.date.slice^(4,6^), d = m.date.slice^(6,8^);
echo     const dateStr = new Date^(`${y}-${mo}-${d}`^).toLocaleDateString^('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }^);
echo     const entry = document.createElement^('article'^);
echo     entry.className = 'musing-entry';
echo     const bodyHtml = m.content.split^(/\n\n+/^).map^(p =^> `^<p^>${p.replace^(/\n/g, '^<br^>'^)}^</p^>`^).join^(''^);
echo     const needsToggle = m.content.length ^> 220;
echo     const num = String^(sorted.length - i^).padStart^(2, '0'^);
echo     entry.innerHTML = `^<div class="musing-bg-title" aria-hidden="true"^>${m.title}^</div^>^<div class="musing-content"^>^<div class="musing-meta"^>^<span class="musing-date"^>${dateStr}^</span^>^<span class="musing-number"^>#${num}^</span^>^</div^>^<h2 class="musing-title"^>${m.title}^</h2^>^<div class="musing-body"^>${bodyHtml}^</div^>${needsToggle ? `^<button class="musing-toggle"^>^<span class="toggle-label"^>Read more^</span^>^<span class="musing-toggle-arrow"^>^</span^>^</button^>` : ''}^</div^>`;
echo     if ^(needsToggle^) { const t = entry.querySelector^('.musing-toggle'^); const l = entry.querySelector^('.toggle-label'^); const x = ^(^) =^> { const e = entry.classList.toggle^('expanded'^); t.setAttribute^('aria-expanded', String^(e^)^); l.textContent = e ? 'Close' : 'Read more'; }; t.addEventListener^('click', x^); entry.querySelector^('.musing-title'^).addEventListener^('click', x^); }
echo     list.appendChild^(entry^);
echo   }^);
echo   if ^(typeof observeEntries === 'function'^) observeEntries^(^);
echo }
echo renderMusings^(^);
) >> "%OUTPUT%"

echo.
echo Fatto! musings.js aggiornato con %count% musings.
pause
