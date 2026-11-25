#!/usr/bin/env python3
"""Checagem de qualidade do Reel final antes de mostrar ao usuário.

Confere: 1080x1920, 30 fps, duração, loudness (-14 LUFS ±1,5; pico <= -1 dBTP)
e gera uma folha de contato com as zonas da interface do Instagram em vermelho
(topo 220 px, base 420 px, laterais 100 px). Nada importante pode cair ali.

Uso:
  python pipeline/verificar.py projetos/x/reel.mp4 [--quadros 12]
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

from comum import duracao, exigir_ffmpeg, rodar, sonda


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--quadros", type=int, default=12)
    a = ap.parse_args()
    exigir_ffmpeg()

    info = sonda(a.video)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    au = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    num, den = map(int, v["r_frame_rate"].split("/"))
    fps = num / den
    dur = duracao(a.video)

    r = rodar(["ffmpeg", "-nostats", "-i", a.video, "-af", "ebur128=peak=true", "-f", "null", "-"])
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])
    pico = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r.stderr)[-1])

    checks = [
        ("Resolução 1080x1920", v["width"] == 1080 and v["height"] == 1920, f"{v['width']}x{v['height']}"),
        ("30 fps", abs(fps - 30) < 0.01, f"{fps:.2f}"),
        ("Tem áudio", au is not None, au["sample_rate"] + " Hz" if au else "sem áudio"),
        ("Loudness -14 LUFS (±1,5)", abs(lufs + 14) <= 1.5, f"{lufs:.1f} LUFS"),
        ("Pico real <= -1 dBTP", pico <= -0.9, f"{pico:.1f} dBTP"),
        ("Duração entre 15 s e 180 s", 15 <= dur <= 180, f"{dur:.1f} s"),
    ]

    saida = Path(a.video).with_name(Path(a.video).stem + "_verificacao.png")
    passo = dur / (a.quadros + 1)
    zonas = (
        "drawbox=x=0:y=0:w=iw:h=220:color=red@0.28:t=fill,"
        "drawbox=x=0:y=ih-420:w=iw:h=420:color=red@0.28:t=fill,"
        "drawbox=x=0:y=220:w=100:h=ih-640:color=red@0.18:t=fill,"
        "drawbox=x=iw-100:y=220:w=100:h=ih-640:color=red@0.18:t=fill"
    )
    colunas = 6 if a.quadros > 6 else a.quadros
    linhas = -(-a.quadros // colunas)
    rodar([
        "ffmpeg", "-y", "-i", a.video, "-vf",
        f"fps=1/{passo:.3f},{zonas},scale=360:640,tile={colunas}x{linhas}:padding=8:color=white",
        "-frames:v", "1", str(saida),
    ])

    print("\nChecagem do Reel\n")
    for nome, ok, valor in checks:
        print(f"  [{'OK ' if ok else 'FALHOU'}] {nome}: {valor}")
    print(f"\nFolha de contato (zonas da interface em vermelho): {saida}")
    print("Olhe a folha: legenda, números e rosto não podem ficar nas faixas vermelhas.")
    if not all(ok for _, ok, _ in checks):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
