#!/usr/bin/env python3
"""Padroniza as gravações e junta as tomadas na ordem certa.

Saída: vídeo 1080x1920, 30 fps constantes, H.264 (GOP de 30 quadros para busca
precisa), áudio AAC 48 kHz. Aceita MP4, MOV (iPhone) e WEBM (teleprompter).

Uso:
  python pipeline/preparar.py gravacoes/bloco-01*.webm gravacoes/bloco-02*.mp4 -o projetos/x/bruto.mp4
  python pipeline/preparar.py gravacoes/  -o projetos/x/bruto.mp4   (pasta: ordem alfabética)
"""
from __future__ import annotations

import argparse
import tempfile
from pathlib import Path

from comum import exigir_ffmpeg, rodar, sonda, erro

EXT = {".mp4", ".mov", ".m4v", ".webm", ".mkv"}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("entradas", nargs="+")
    ap.add_argument("-o", "--saida", required=True)
    a = ap.parse_args()
    exigir_ffmpeg()

    arquivos: list[Path] = []
    for e in a.entradas:
        p = Path(e)
        if p.is_dir():
            arquivos += sorted(x for x in p.iterdir() if x.suffix.lower() in EXT)
        elif p.exists():
            arquivos.append(p)
        else:
            erro(f"arquivo não encontrado: {e}")
    if not arquivos:
        erro("nenhum vídeo encontrado.")

    tmp = Path(tempfile.mkdtemp(prefix="reel_prep_"))
    partes = []
    for i, arq in enumerate(arquivos):
        info = sonda(arq)
        v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
        if not v:
            erro(f"{arq} não tem trilha de vídeo.")
        w, h = v["width"], v["height"]
        rot = 0
        for sd in v.get("side_data_list", []) or []:
            rot = int(sd.get("rotation", 0))
        if abs(rot) in (90, 270):
            w, h = h, w
        if w > h:
            print(f"[aviso] {arq.name} está na horizontal ({w}x{h}). Vou recortar o centro em 9:16; "
                  "o ideal é gravar na vertical.")
        destino = tmp / f"p{i:03d}.mp4"
        filtro = (
            "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,"
            "crop=1080:1920,setsar=1,fps=30,format=yuv420p"
        )
        rodar([
            "ffmpeg", "-y", "-i", str(arq), "-vf", filtro,
            "-af", "aresample=48000:async=1",
            "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-g", "30", "-keyint_min", "30",
            "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2",
            str(destino),
        ])
        partes.append(destino)
        print(f"[ok] {arq.name}")

    lista = tmp / "lista.txt"
    lista.write_text("".join(f"file '{p.as_posix()}'\n" for p in partes), encoding="utf-8")
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    rodar(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", a.saida])
    print(f"\nPronto: {a.saida} ({len(partes)} tomada(s) unidas)")


if __name__ == "__main__":
    main()
