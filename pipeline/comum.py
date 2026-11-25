"""Funções compartilhadas pelo pipeline de Reels."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

FPS = 30


def erro(msg: str) -> None:
    print(f"\n[ERRO] {msg}\n", file=sys.stderr)
    sys.exit(1)


def exigir_ffmpeg() -> None:
    for b in ("ffmpeg", "ffprobe"):
        if not shutil.which(b):
            erro(f"'{b}' não encontrado. Instale o FFmpeg (https://ffmpeg.org/download.html) e tente de novo.")


def rodar(cmd: list[str], silencioso: bool = True) -> subprocess.CompletedProcess:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(" ".join(cmd), file=sys.stderr)
        print(r.stderr[-3000:], file=sys.stderr)
        erro("o comando acima falhou.")
    if not silencioso:
        print(r.stdout)
    return r


def sonda(caminho: str | Path) -> dict:
    r = rodar([
        "ffprobe", "-v", "error", "-show_entries",
        "stream=codec_type,width,height,r_frame_rate,sample_rate:stream_side_data=rotation:format=duration",
        "-of", "json", str(caminho),
    ])
    return json.loads(r.stdout)


def duracao(caminho: str | Path) -> float:
    return float(sonda(caminho)["format"]["duration"])


def normal(txt: str) -> str:
    """minúsculas, sem acento, sem pontuação (para comparar falas)."""
    txt = unicodedata.normalize("NFD", txt.lower())
    txt = "".join(c for c in txt if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9% ]+", " ", txt).strip()


def tokens(txt: str) -> list[str]:
    return [t for t in normal(txt).split() if t]


def ler_json(p: str | Path):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def salvar_json(p: str | Path, dados) -> None:
    Path(p).write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")


def ao_frame(t: float) -> float:
    return round(t * FPS) / FPS


def ler_teleprompter(p: str | Path) -> list[tuple[str, str]]:
    """Lê o formato '## Título' + texto. Retorna [(titulo, texto)]."""
    blocos, titulo, linhas = [], None, []
    for linha in Path(p).read_text(encoding="utf-8").splitlines():
        if linha.startswith("## "):
            if titulo is not None:
                blocos.append((titulo, " ".join(linhas).strip()))
            titulo, linhas = linha[3:].strip(), []
        elif linha.strip():
            linhas.append(linha.strip())
    if titulo is not None:
        blocos.append((titulo, " ".join(linhas).strip()))
    return blocos


def frases_do_roteiro(p: str | Path) -> list[str]:
    frases = []
    for _, texto in ler_teleprompter(p):
        frases += [f.strip() for f in re.split(r"(?<=[.!?])\s+", texto) if f.strip()]
    return frases
