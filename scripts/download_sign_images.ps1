<#
PowerShell helper to download sign images into assets/images
Run this script from the project root in PowerShell:
  .\scripts\download_sign_images.ps1
It will prompt for a public image URL for each sign and save it to assets/images with a fixed filename.
#>

$images = @(
  @{ key = 'hello'; prompt = 'URL for "Hello" image' },
  @{ key = 'iloveyou'; prompt = 'URL for "I Love You" image' },
  @{ key = 'no'; prompt = 'URL for "No" image' },
  @{ key = 'sorry'; prompt = 'URL for "Sorry" image' },
  @{ key = 'thankyou'; prompt = 'URL for "Thank You" image' },
  @{ key = 'understood'; prompt = 'URL for "Understood" image' },
  @{ key = 'weare'; prompt = 'URL for "We Are" image' },
  @{ key = 'yes'; prompt = 'URL for "Yes" image' }
)

$destDir = Join-Path -Path (Get-Location) -ChildPath 'assets\images'
if (-not (Test-Path $destDir)) {
  New-Item -ItemType Directory -Path $destDir | Out-Null
}

foreach ($img in $images) {
  $url = Read-Host "$($img.prompt) (leave empty to skip)"
  if ([string]::IsNullOrWhiteSpace($url)) {
    Write-Host "Skipped $($img.key)"
    continue
  }
  try {
    $uri = [System.Uri]::new($url)
    $ext = [System.IO.Path]::GetExtension($uri.AbsolutePath)
    if ([string]::IsNullOrEmpty($ext)) { $ext = '.jpg' }
    $out = Join-Path $destDir "$($img.key)$ext"
    Write-Host "Downloading $url -> $out"
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    Write-Host "Saved $out"
  } catch {
    Write-Warning "Failed to download $url : $_"
  }
}

Write-Host "Done. You can now refresh the education page to see the images."