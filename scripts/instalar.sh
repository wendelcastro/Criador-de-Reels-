#!/usr/bin/env bash
# Instalação de um comando só (macOS e Linux). Pode rodar de novo sem medo: só instala o que falta.
set -e
cd "$(dirname "$0")/.."

if [[ "$OSTYPE" == darwin* ]]; then
  if ! command -v brew >/dev/null; then
    echo "Instalando o Homebrew (vai pedir a senha do Mac)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
  fi
  for p in ffmpeg python node; do
    b=$p; [ "$p" = python ] && b=python3
    command -v "$b" >/dev/null || brew install "$p"
  done
else
  for b in ffmpeg python3 node npm; do
    command -v "$b" >/dev/null || { echo "Falta '$b'. Rode: sudo apt install ffmpeg python3-pip nodejs npm"; exit 1; }
  done
fi

echo "1/3 Transcrição (faster-whisper)..."
python3 -m pip install --user -q -r pipeline/requirements.txt 2>/dev/null || python3 -m pip install --user -q --break-system-packages -r pipeline/requirements.txt

echo "2/3 Motor de vídeo (Remotion)..."
(cd video && npm install --no-audit --no-fund --silent)

echo "3/3 Baixando o modelo de voz em português (uma vez só, ~1,5 GB)..."
python3 -c "from faster_whisper import WhisperModel; WhisperModel('medium', device='cpu', compute_type='int8')"

echo
echo "Tudo pronto. Agora abra o Claude Code nesta pasta:  claude"
