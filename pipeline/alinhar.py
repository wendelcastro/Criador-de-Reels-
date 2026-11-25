#!/usr/bin/env python3
"""Casa o plano de cenas com o que foi falado e gera o props.json do render.

- Cada cena começa 0,1 s antes da sua "ancora" (as primeiras palavras da fala),
  então o esquema aparece junto com a palavra, nunca antes dela.
- Itens de lista/comparativo com "ancora" própria aparecem um a um, na palavra.
- As legendas usam a GRAFIA do roteiro (acentos, nomes próprios, pontuação)
  com o TEMPO do Whisper.

Uso:
  Antes de gravar (prévia com tempos estimados e apresentador de exemplo):
    python pipeline/alinhar.py projetos/x --simular
  Depois de cortar:
    python pipeline/alinhar.py projetos/x --video projetos/x/editado.mp4
"""
from __future__ import annotations

import argparse
import re
import shutil
import sys
from difflib import SequenceMatcher
from pathlib import Path

from comum import ler_json, ler_teleprompter, normal, salvar_json, tokens

RAIZ = Path(__file__).resolve().parent.parent
ANTECIPA = 0.1


def simular_palavras(roteiro: Path) -> list[dict]:
    t, saida = 0.3, []
    for _, texto in ler_teleprompter(roteiro):
        for w in texto.split():
            dur = 0.11 + 0.045 * len(normal(w))
            saida.append({"w": w, "s": round(t, 3), "e": round(t + dur, 3)})
            t += dur + 0.05
            if w.endswith((".", "!", "?")):
                t += 0.35
            elif w.endswith((",", ":", ";")):
                t += 0.15
        t += 0.2
    return saida


def corrigir_grafia(palavras: list[dict], roteiro: Path) -> int:
    script = [w for _, txt in ler_teleprompter(roteiro) for w in txt.split()]
    a = [normal(p["w"]).replace(" ", "") for p in palavras]
    b = [normal(w).replace(" ", "") for w in script]
    trocas = 0
    for op, i1, i2, j1, j2 in SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
            for i, j in zip(range(i1, i2), range(j1, j2)):
                if palavras[i]["w"] != script[j]:
                    palavras[i]["w"] = script[j]
                    trocas += 1
    return trocas


def achar(ancora: str, toks: list[str], de: int, ate: int | None = None) -> tuple[int, float]:
    alvo = tokens(ancora)
    n = len(alvo)
    melhor, nota = -1, 0.0
    for i in range(de, (ate or len(toks)) - n + 1):
        r = SequenceMatcher(None, alvo, toks[i : i + n]).ratio()
        if r > nota + 1e-9:
            melhor, nota = i, r
        if r >= 0.99:
            break
    return melhor, nota


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("projeto", help="pasta do projeto (com cenas.plan.json e teleprompter.txt)")
    ap.add_argument("--simular", action="store_true")
    ap.add_argument("--video", help="vídeo editado (sai do cortar.py --aplicar)")
    a = ap.parse_args()

    pasta = Path(a.projeto)
    plano = ler_json(pasta / "cenas.plan.json")
    roteiro = pasta / "teleprompter.txt"
    nome = plano.get("projeto", pasta.name)

    if a.simular:
        palavras = simular_palavras(roteiro)
        duracao = palavras[-1]["e"] + 0.8
        video = ""
    else:
        dados = ler_json(pasta / "palavras_editadas.json")
        palavras, duracao = dados["palavras"], dados["duracao"]
        n = corrigir_grafia(palavras, roteiro)
        print(f"Grafia das legendas ajustada pelo roteiro em {n} palavra(s).")
        origem = Path(a.video or pasta / "editado.mp4")
        publico = RAIZ / "video" / "public"
        publico.mkdir(parents=True, exist_ok=True)
        video = f"{nome}.mp4"
        shutil.copy2(origem, publico / video)

    toks = [normal(p["w"]).replace(" ", "") for p in palavras]
    cenas, cursor, avisos = [], 0, []
    for k, c in enumerate(plano["cenas"]):
        if k == 0:
            idx, nota = 0, 1.0
        else:
            idx, nota = achar(c["ancora"], toks, cursor)
            if idx < 0:
                avisos.append(f"cena {k + 1}: âncora '{c['ancora']}' não encontrada; cena ignorada")
                continue
            if nota < 0.75:
                avisos.append(f"cena {k + 1}: âncora '{c['ancora']}' casou fraco ({nota:.0%}) com "
                              f"'{' '.join(p['w'] for p in palavras[idx: idx + 4])}'")
        inicio = 0.0 if k == 0 else max(palavras[idx]["s"] - ANTECIPA, 0.0)
        cursor = idx + 1
        cena = {"inicio": round(inicio, 3), "layout": c.get("layout", "split"), "zoom": bool(c.get("zoom")),
                "grafico": c.get("grafico"), "_idx": idx}
        cenas.append(cena)

    for k, c in enumerate(cenas):
        c["fim"] = cenas[k + 1]["inicio"] if k + 1 < len(cenas) else round(duracao, 3)
        g = c.get("grafico")
        if g and isinstance(g.get("itens"), list):
            fim_idx = cenas[k + 1]["_idx"] if k + 1 < len(cenas) else len(toks)
            for it in g["itens"]:
                if isinstance(it, dict) and it.get("ancora"):
                    i, nota = achar(it.pop("ancora"), toks, c["_idx"], fim_idx)
                    if i >= 0 and nota >= 0.6:
                        it["t"] = round(max(palavras[i]["s"] - ANTECIPA - c["inicio"], 0.2), 3)
    for c in cenas:
        c.pop("_idx")

    props = {
        "video": video,
        "duracao": round(duracao, 3),
        "focoY": plano.get("focoY", 0.38),
        "fonte": plano.get("fonte"),
        "destaques": plano.get("destaques", []),
        "musica": plano.get("musica"),
        "volumeMusica": plano.get("volumeMusica", 0.08),
        "palavras": [{"w": p["w"], "s": p["s"], "e": p["e"]} for p in palavras],
        "cenas": cenas,
    }
    destino = pasta / ("props.simulado.json" if a.simular else "props.json")
    salvar_json(destino, props)

    print(f"\n{'#':>2}  {'início':>6}  {'dur':>5}  {'layout':8} gráfico")
    for k, c in enumerate(cenas):
        d = c["fim"] - c["inicio"]
        g = c["grafico"]["tipo"] if c.get("grafico") else "-"
        alerta = "  <- curta demais" if d < 1.2 else ("  <- longa, considere dividir" if d > 9 and g != "-" else "")
        print(f"{k + 1:>2}  {c['inicio']:6.1f}  {d:5.1f}  {c['layout']:8} {g}{alerta}")
    for av in avisos:
        print(f"[aviso] {av}", file=sys.stderr)
    print(f"\nDuração: {duracao:.1f} s  |  props: {destino}")


if __name__ == "__main__":
    main()
