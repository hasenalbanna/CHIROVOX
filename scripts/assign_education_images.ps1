<#
assign_education_images.ps1

A safer script to locate AI-generated education sign images by keyword and copy them to
assets/images/education_signs/1.jpg .. 8.jpg in the correct order.

It normalizes filenames (removes punctuation, lowercases) before matching so long descriptive
filenames won't fail.

Run from project root:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\assign_education_images.ps1
#>

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$folder = Join-Path $scriptRoot "..\assets\images\education_signs" | Resolve-Path | Select-Object -ExpandProperty Path
Write-Host "Folder: $folder`n"

$files = Get-ChildItem -Path $folder -File
if ($files.Count -lt 1) { Write-Error "No files found in $folder"; exit }

function Normalize([string]$s) {
    # lowercase, remove non-alphanum, collapse whitespace
    $s = $s.ToLower()
    $s = -join ($s.ToCharArray() | Where-Object { $_ -match '[a-z0-9]' })
    return $s
}

# keywords mapped to target numbers (1..8)
$mappings = @{
    1 = @('hello')
    2 = @('iloveyou', 'i love', 'i_love')
    3 = @('no', 'negative')
    4 = @('sorry')
    5 = @('thank', 'thankyou', 'thank_you')
    6 = @('understood')
    7 = @('weare', 'we_are', 'we are')
    8 = @('yes')
}

# Build index of normalized names
$index = @{}
foreach ($f in $files) { $index[$f.FullName] = Normalize($f.Name) }

$planned = @()
foreach ($num in $mappings.Keys | Sort-Object) {
    $found = $null
    foreach ($kf in $mappings[$num]) {
        $match = $index.GetEnumerator() | Where-Object { $_.Value -like ("*$kf*") } | Select-Object -First 1
        if ($match) { $found = $match.Key; break }
    }
    $destName = "{0}.jpg" -f $num
    if ($found) {
        $planned += [PSCustomObject]@{Num = $num; Source = (Split-Path $found -Leaf); SourcePath = $found; Dest = $destName }
    }
    else {
        $planned += [PSCustomObject]@{Num = $num; Source = $null; SourcePath = $null; Dest = $destName }
    }
}

Write-Host "Planned mapping:" -ForegroundColor Cyan
$planned | Format-Table Num, Source, Dest -AutoSize

$okay = Read-Host "Proceed to copy the found files to the destination names? (yes/no)"
if ($okay -notin @('yes', 'y')) { Write-Host "Aborted"; exit }

foreach ($p in $planned) {
    if ($p.SourcePath) {
        $destPath = Join-Path $folder $p.Dest
        Copy-Item -Path $p.SourcePath -Destination $destPath -Force
        Write-Host "Copied $($p.Source) -> $($p.Dest)" -ForegroundColor Green
    }
    else {
        Write-Warning "No source found for $($p.Dest)"
    }
}

Write-Host "Done. Please refresh your browser to see images on the education page." -ForegroundColor Yellow
