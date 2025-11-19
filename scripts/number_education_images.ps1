<#
number_education_images.ps1

This script will rename files in assets/images/education_signs to 1.jpg, 2.jpg, ..., 8.jpg.
It will DISPLAY the planned renames first and ask for confirmation. It will COPY files to preserve originals.

Run from project root:
& .\scripts\number_education_images.ps1
#>

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$folder = Join-Path $scriptRoot "..\assets\images\education_signs" | Resolve-Path | Select-Object -ExpandProperty Path
Write-Host "Preparing to number files in: $folder`n"

$files = Get-ChildItem -Path $folder -File | Sort-Object Name
if ($files.Count -lt 1) { Write-Error "No files found in $folder"; exit }

# Build planned renames: use first 8 files (if less than 8, only those will be processed)
$planned = @()
for ($i = 0; $i -lt [Math]::Min(8, $files.Count); $i++) {
    $src = $files[$i]
    $ext = $src.Extension
    $destName = "{0}{1}" -f ($i + 1), $ext
    $dest = Join-Path $folder $destName
    $planned += [PSCustomObject]@{Index = $i + 1; Source = $src.Name; Destination = $destName }
}

Write-Host "Planned renames (copy):`n" -ForegroundColor Cyan
$planned | Format-Table Index, Source, Destination -AutoSize

$confirm = Read-Host "Proceed with copying these files? (yes/no)"
if ($confirm -notin @('yes', 'y')) { Write-Host "Aborted"; exit }

foreach ($p in $planned) {
    $srcPath = Join-Path $folder $p.Source
    $destPath = Join-Path $folder $p.Destination
    Copy-Item -Path $srcPath -Destination $destPath -Force
    Write-Host "Copied $($p.Source) -> $($p.Destination)" -ForegroundColor Green
}

Write-Host "Done. New files written to $folder" -ForegroundColor Yellow
