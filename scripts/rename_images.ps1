<#
rename_images.ps1

Find AI-generated images in assets/images and copy them to the standard filenames used
by `education.html` (hello.jpg, iloveyou.jpg, no.jpg, sorry.jpg, thankyou.jpg,
understood.jpg, weare.jpg, yes.jpg). This script copies (does not delete) so you can
inspect originals.

Run from project root (PowerShell):
& .\scripts\rename_images.ps1
#>

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$imagesDir = Join-Path $scriptRoot "..\assets\images" | Resolve-Path | Select-Object -ExpandProperty Path
Write-Output "Images folder: $imagesDir`n"

# Mapping: target filename => list of regex patterns to try
$mappings = @{
    'hello.jpg'      = @('hello')
    'iloveyou.jpg'   = @('i.?love', 'ilov', 'love you')
    'no.jpg'         = @('\bno\b')
    'sorry.jpg'      = @('sorry')
    'thankyou.jpg'   = @('thank[_ ]?you', 'thank')
    'understood.jpg' = @('understood')
    'weare.jpg'      = @('we.?are', 'we are')
    'yes.jpg'        = @('\byes\b')
}

# file extensions to consider
$exts = @('*.jpg', '*.jpeg', '*.png', '*.webp')
$allFiles = Get-ChildItem -Path $imagesDir -File | Where-Object { $exts -contains ("*" + $_.Extension.TrimStart('.').ToLower()) }

foreach ($target in $mappings.Keys) {
    $patterns = $mappings[$target]
    $found = $null
    foreach ($p in $patterns) {
        $found = $allFiles | Where-Object { $_.Name -match "(?i)$p" } | Select-Object -First 1
        if ($found) { break }
    }
    if ($found) {
        $dest = Join-Path $imagesDir $target
        Copy-Item -Path $found.FullName -Destination $dest -Force
        Write-Host "Copied `"$($found.Name)`" -> `"$target`"" -ForegroundColor Green
    }
    else {
        Write-Warning "No match found for $target (looked for: $($patterns -join ', '))"
    }
}

Write-Output "\nDone. Check the files in $imagesDir and then open education.html in the browser."