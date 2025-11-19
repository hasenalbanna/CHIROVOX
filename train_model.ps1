# train_model.ps1
# Helper to train the gesture model using the included venv (venv_tfjs)
# Usage: Right-click -> Run with PowerShell or execute in a PowerShell terminal.

$venv = Join-Path $PSScriptRoot 'venv_tfjs\Scripts\Activate.ps1'
$python = Join-Path $PSScriptRoot 'venv_tfjs\Scripts\python.exe'

if (Test-Path $venv) {
    Write-Host "Activating virtual environment..."
    & $venv
}
else {
    Write-Host "Virtualenv activate script not found at $venv. Ensure venv exists or use system Python." -ForegroundColor Yellow
}

if (Test-Path $python) {
    Write-Host "Running training script with: $python"
    & $python "model\train.py"
}
else {
    Write-Host "Python executable not found at $python. Please install dependencies and run: python model\train.py" -ForegroundColor Red
}
