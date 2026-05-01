$ErrorActionPreference = "Stop"

$Dir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$Data   = Join-Path $Dir "data"
$Out    = Join-Path $Dir "musings.js"
$Render = Join-Path $Dir "_render.js"

if (!(Test-Path $Data)) {
  throw "Cartella data non trovata: $Data"
}
if (!(Test-Path $Render)) {
  throw "File _render.js non trovato: $Render"
}

function Normalize-Text([string]$s) {
  $s = $s -replace "`r`n", "`n"
  $s = $s -replace "`r", "`n"
  return $s.TrimEnd("`r", "`n")
}

$files = Get-ChildItem -Path $Data -Filter "*.txt" | Sort-Object Name -Descending

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("// AUTO-GENERATED — non modificare manualmente.")
[void]$sb.AppendLine("// Rigenera con doppio clic su update_musings.bat")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("const MUSINGS = [")

$first = $true
foreach ($file in $files) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  if ($name.Length -lt 10) { continue }

  $date = $name.Substring(0, 8)
  if ($date -notmatch '^\d{8}$') { continue }

  $title = $name.Substring(9)
  $raw = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $content = Normalize-Text $raw

  $titleJson = ConvertTo-Json $title -Compress
  $contentJson = ConvertTo-Json $content -Compress

  if (-not $first) { [void]$sb.AppendLine(",") }
  $first = $false

  [void]$sb.AppendLine("  {")
  [void]$sb.AppendLine("    date: '$date',")
  [void]$sb.AppendLine("    title: $titleJson,")
  [void]$sb.AppendLine("    content: $contentJson")
  [void]$sb.AppendLine("  }")
}

[void]$sb.AppendLine("]; ")
[void]$sb.AppendLine("")
[void]$sb.Append([System.IO.File]::ReadAllText($Render, [System.Text.Encoding]::UTF8))

[System.IO.File]::WriteAllText($Out, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "musings.js aggiornato leggendo i .txt da: data"
