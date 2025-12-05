<#
  move_project.ps1
  Usage: Run this from the repository root in PowerShell (Windows).

  What it does:
  - Creates `backend` and `frontend` folders if missing
  - Moves known backend files/folders into `backend/`
  - Moves `client/` into `frontend/`
  - Leaves top-level README.md, .git, .env alone
  - Safe: checks for existence before moving

  Run:
    powershell.exe -ExecutionPolicy Bypass -File .\move_project.ps1
#>

Write-Host "Starting project reorganization..."
$root = Get-Location

function SafeMove($source, $destDir) {
  if (Test-Path $source) {
    Write-Host "Moving: $source -> $destDir"
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
    $dest = Join-Path $destDir (Split-Path $source -Leaf)
    if (Test-Path $dest) {
      Write-Host "Destination exists, will overwrite: $dest"
      Remove-Item -Recurse -Force $dest
    }
    Move-Item -Path $source -Destination $destDir -Force
  } else {
    Write-Host "Not found (skipping): $source"
  }
}

# Create folders
if (-not (Test-Path "backend")) { New-Item -ItemType Directory -Path "backend" | Out-Null }
if (-not (Test-Path "frontend")) { New-Item -ItemType Directory -Path "frontend" | Out-Null }

# Move client folder into frontend
SafeMove "client" (Join-Path $root "frontend")

# Common backend items to move
$backendItems = @(
  "src",
  "models",
  "routes",
  "middleware",
  "config",
  "docs",
  "scripts",
  "tests",
  "postman_collection.json",
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "README.md"
)

foreach ($item in $backendItems) {
  # Skip README.md because we may want it at root; move a copy into backend instead
  if ($item -eq 'README.md') {
    if (Test-Path $item) {
      Copy-Item -Path $item -Destination (Join-Path $root "backend") -Force
      Write-Host "Copied README.md into backend/"
    }
    continue
  }
  SafeMove $item (Join-Path $root "backend")
}

Write-Host "Reorganization complete."
Write-Host "Please review changes, run tests/build, and commit the moved files to your repo." 

Write-Host "Note: This script moves a set of common files. If your project has other top-level files to relocate, move them manually or edit this script." 
