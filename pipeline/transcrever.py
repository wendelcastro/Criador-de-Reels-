#!/usr/bin/env python3
"""Transcreve em português com timestamp por palavra, 100% local (faster-whisper).

O prompt inicial "sujo" de propósito faz o Whisper MANTER os vícios de linguagem
(é..., hã, né) em vez de limpá-los. Sem isso não dá para cortá-los depois.

Uso:
  python pipeline/transcrever.py projetos/x/bruto.mp4 -o projetos/x/transcricao.json [--modelo medium] [--roteiro teleprompter.txt]
Modelos: small (rápido), medium (equilíbrio, padrão), large-v3 (máxima precisão, ideal com GPU).
"""
from __future__ import annotations

import argparse
import tempfile
from pathlib import Path

from comum import erro, exigir_ffmpeg, rodar, salvar_json, ler_teleprompter

PROMPT_VERBATIM = "Hã, é... então, tipo, né, eh, a a gente, hum, vamos lá."


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("-o", "--saida", required=True)
    ap.add_argument("--modelo", default="medium")
    ap.add_argument("--roteiro", help="teleprompter.txt: nomes próprios entram no prompt para acertar a grafia")
    a = ap.parse_args()
    exigir_ffmpeg()
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        erro("instale as dependências: pip install -r pipeline/requirements.txt")

    wav = Path(tempfile.mkdtemp()) / "audio.wav"
    rodar(["ffmpeg", "-y", "-i", a.video, "-vn", "-ac", "1", "-ar", "16000", str(wav)])

    prompt = PROMPT_VERBATIM
    if a.roteiro:
        import re
        texto = " ".join(t for _, t in ler_teleprompter(a.roteiro))
        nomes = sorted(set(re.findall(r"\b[A-Z][a-zA-ZÀ-ú]{2,}\b", texto)))
        prompt += " Termos: " + ", ".join(nomes[:40]) + "."

    try:
        import torch  # noqa: F401
        dispositivo = "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:
        dispositivo = "cpu"
    tipo = "float16" if dispositivo == "cuda" else "int8"
    print(f"Carregando modelo '{a.modelo}' em {dispositivo} (a primeira vez baixa o modelo)...")
    modelo = WhisperModel(a.modelo, device=dispositivo, compute_type=tipo)

    segs, info = modelo.transcribe(
        str(wav),
        language="pt",
        word_timestamps=True,
        temperature=0,
        initial_prompt=prompt,
        vad_filter=False,  # VAD derruba hesitações curtas; queremos ver tudo
        condition_on_previous_text=False,
    )
    palavras = []
    for s in segs:
        for w in s.words or []:
            txt = w.word.strip()
            if not txt:
                continue
            palavras.append({"w": txt, "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
        print(f"  {s.start:6.1f}s  {s.text.strip()}")

    salvar_json(a.saida, {"idioma": info.language, "duracao": info.duration, "palavras": palavras})
    print(f"\nPronto: {a.saida} ({len(palavras)} palavras)")


if __name__ == "__main__":
    main()
