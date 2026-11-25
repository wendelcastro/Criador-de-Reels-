#!/usr/bin/env bash
# Instala as dependências do Criador de Reels (macOS/Linux).
set -e
cd "$(dirname "$0")/.."

for b in ffmpeg python3 node npm; do
  command -v "$b" >/dev/null || { echo "Falta '$b'. Veja a seção Instalação do README."; exit 1; }
done

echo "1/2 Python (faster-whisper)..."
python3 -m pip install -r pipeline/requirements.txt

echo "2/2 Motor de vídeo (Remotion)..."
(cd video && npm install)

echo
echo "Pronto. Teste a prévia com:"
echo "  python3 pipeline/alinhar.py projetos/working-with-ai --simular"
echo "  cp projetos/working-with-ai/props.simulado.json video/src/data/demo.json"
echo "  cd video && npm run studio"
