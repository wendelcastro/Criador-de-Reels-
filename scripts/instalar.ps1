# Instalação de um comando só (Windows). No PowerShell, dentro da pasta do projeto:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar.ps1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

function Tem($cmd) { $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue) }

if (-not (Tem ffmpeg)) { winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements }
if (-not (Tem python)) { winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements }
if (-not (Tem node))   { winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements }
$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")

Write-Host "1/3 Transcrição (faster-whisper)..."
python -m pip install -q -r pipeline\requirements.txt

Write-Host "2/3 Motor de vídeo (Remotion)..."
Push-Location video; npm install --no-audit --no-fund --silent; Pop-Location

Write-Host "3/3 Baixando o modelo de voz em português (uma vez só, ~1,5 GB)..."
python -c "from faster_whisper import WhisperModel; WhisperModel('medium', device='cpu', compute_type='int8')"

Write-Host ""
Write-Host "Tudo pronto. Feche e abra o terminal, entre nesta pasta e digite:  claude"
