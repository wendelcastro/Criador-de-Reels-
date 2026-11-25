#!/usr/bin/env python3
"""Limpa a gravação: tira hesitações, tomadas repetidas e pausas longas.

Funciona em duas etapas, de propósito:
  1) SEM --aplicar: gera cortes.json + cortes.md (relatório legível citando o que
     foi falado). Mostre o relatório ao usuário e peça aprovação.
  2) COM --aplicar: renderiza o vídeo limpo, normaliza o áudio em -14 LUFS e grava
     palavras_editadas.json (timestamps já na linha do tempo nova).

Regras (consolidadas de video-use, ChatCut e claude-editing-skills):
  - corta só entre palavras, nunca no meio de uma;
  - 50 ms de respiro antes da primeira palavra e 80 ms depois da última;
  - fade de áudio de 30 ms em cada emenda (sem estalos);
  - pausas acima de 0,8 s viram ~0,3 s (0,45 s no fim de frase); nunca zero;
  - hesitações puras (hã, ãh, hum, eh, "é..." arrastado) saem sempre;
  - "tipo", "né", "então", "aí" só saem com --agressivo e quando isolados por pausa;
  - tomada repetida: fica a ÚLTIMA tentativa completa; nunca costura pedaços;
  - falar "corta" ou "de novo" descarta a frase anterior e a própria palavra.

Uso:
  python pipeline/cortar.py projetos/x/bruto.mp4 projetos/x/transcricao.json --roteiro projetos/x/teleprompter.txt
  python pipeline/cortar.py projetos/x/bruto.mp4 projetos/x/transcricao.json --roteiro ... --aplicar -o projetos/x/editado.mp4
"""
from __future__ import annotations

import argparse
import json
import math
import re
import tempfile
from difflib import SequenceMatcher
from pathlib import Path

from comum import FPS, exigir_ffmpeg, frases_do_roteiro, ler_json, normal, rodar, salvar_json, tokens

HESITACOES = {"ha", "ah", "ahn", "hum", "hmm", "hm", "eh", "ehh", "uh", "um", "uhm", "ee", "eee", "aa", "aaa"}
MULETAS = {"tipo", "ne", "entao", "ai", "assim", "enfim"}
MARCADORES = [("corta",), ("de", "novo"), ("vou", "repetir"), ("repetindo",), ("deixa", "eu", "repetir")]

PAD_ANTES = 0.05
PAD_DEPOIS = 0.08
PAUSA_MAX = 0.8
PAUSA_FRASE = 0.45
PAUSA_MEIO = 0.30
QUEBRA_FRASE = 0.5
FADE = 0.03


def fim_de_frase(w: str) -> bool:
    return w.rstrip().endswith((".", "!", "?", "…"))


def eh_hesitacao(p: dict, ant: dict | None, prox: dict | None) -> bool:
    n = normal(p["w"]).replace(" ", "")
    if n in HESITACOES or re.fullmatch(r"h*m{2,}|hu+m+|e{2,}h*|a{2,}h*|ah+n*|h+a+", n or "x"):
        return True
    if n == "e":  # "é..." arrastado ou "e..." solto entre pausas
        arrastado = "..." in p["w"] or "…" in p["w"] or (p["e"] - p["s"]) >= 0.45
        isolado = (ant is None or p["s"] - ant["e"] >= 0.15) and (prox is None or prox["s"] - p["e"] >= 0.15)
        return arrastado and isolado
    return False


def eh_muleta(p: dict, ant: dict | None, prox: dict | None) -> bool:
    n = normal(p["w"])
    isolado = (ant is None or p["s"] - ant["e"] >= 0.25) and (prox is None or prox["s"] - p["e"] >= 0.25)
    return n in MULETAS and isolado


def agrupar_frases(idx: list[int], P: list[dict]) -> list[list[int]]:
    frases, atual = [], []
    for k, i in enumerate(idx):
        atual.append(i)
        prox = idx[k + 1] if k + 1 < len(idx) else None
        if prox is None or fim_de_frase(P[i]["w"]) or P[prox]["s"] - P[i]["e"] >= QUEBRA_FRASE:
            frases.append(atual)
            atual = []
    return frases


def melhor_frase(toks: list[str], roteiro: list[list[str]]) -> tuple[int, float]:
    melhor, nota = -1, 0.0
    for j, ref in enumerate(roteiro):
        r = SequenceMatcher(None, toks, ref[: max(len(toks), 1) + 2]).ratio()
        if r > nota:
            melhor, nota = j, r
    return melhor, nota


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("transcricao")
    ap.add_argument("--roteiro", help="teleprompter.txt (melhora muito a detecção de tomadas repetidas)")
    ap.add_argument("--agressivo", action="store_true", help="também corta muletas isoladas (tipo, né, então...)")
    ap.add_argument("--aplicar", action="store_true")
    ap.add_argument("-o", "--saida", help="vídeo editado (padrão: editado.mp4 ao lado do bruto)")
    a = ap.parse_args()

    pasta = Path(a.transcricao).parent
    P = ler_json(a.transcricao)["palavras"]
    remover: dict[int, str] = {}

    # 1. Hesitações e muletas
    for i, p in enumerate(P):
        ant = P[i - 1] if i else None
        prox = P[i + 1] if i + 1 < len(P) else None
        if eh_hesitacao(p, ant, prox):
            remover[i] = "hesitação"
        elif a.agressivo and eh_muleta(p, ant, prox):
            remover[i] = "muleta"

    restantes = [i for i in range(len(P)) if i not in remover]
    frases = agrupar_frases(restantes, P)

    # 2. Marcadores falados ("corta", "de novo"): some a frase até o marcador;
    #    se o marcador vier logo no início da frase, a frase anterior também sai.
    for k, f in enumerate(frases):
        ts = [normal(P[i]["w"]) for i in f]
        for m in MARCADORES:
            pos = next((x for x in range(len(ts)) if tuple(ts[x : x + len(m)]) == m), None)
            if pos is None:
                continue
            for i in f[: pos + len(m)]:
                remover[i] = "regravação pedida (\"" + " ".join(m) + "\")"
            if pos <= 1 and k > 0:
                for i in frases[k - 1]:
                    remover.setdefault(i, "tomada descartada (antes do marcador)")
            break

    # 3. Tomadas repetidas: a última tentativa completa vence
    roteiro = [tokens(f) for f in frases_do_roteiro(a.roteiro)] if a.roteiro else []
    vivas = [f for f in frases if not all(i in remover for i in f)]
    for k, f in enumerate(vivas):
        tf = [normal(P[i]["w"]) for i in f]
        for g in vivas[k + 1 : k + 5]:
            tg = [normal(P[i]["w"]) for i in g]
            n = min(3, len(tf), len(tg))
            mesmo_inicio = n >= 2 and SequenceMatcher(None, " ".join(tf[:n]), " ".join(tg[:n])).ratio() >= 0.8
            if roteiro and mesmo_inicio:
                jf, rf = melhor_frase(tf, roteiro)
                jg, rg = melhor_frase(tg, roteiro)
                repetida = jf == jg and rf >= 0.4 and rg >= 0.4
            else:
                repetida = mesmo_inicio and (len(tf) <= len(tg) + 2)
            if repetida:
                for i in f:
                    remover.setdefault(i, "tomada repetida (ficou a última)")
                break

    # 4. Segmentos mantidos
    manter = [i for i in range(len(P)) if i not in remover]
    segmentos: list[list[float]] = []
    for k, i in enumerate(manter):
        p = P[i]
        j = manter[k - 1] if k else None
        if j is not None and j == i - 1 and p["s"] - P[j]["e"] <= PAUSA_MAX:
            segmentos[-1][1] = p["e"]  # pausa natural, fica como está
            continue
        if j is None:
            antes = PAD_ANTES
        else:
            meia = (PAUSA_FRASE if fim_de_frase(P[j]["w"]) else PAUSA_MEIO) / 2
            folga_depois = P[j + 1]["s"] - P[j]["e"]  # até a próxima palavra (mantida ou não)
            segmentos[-1][1] = P[j]["e"] + max(min(meia, folga_depois), min(PAD_DEPOIS, folga_depois))
            folga_antes = p["s"] - P[i - 1]["e"]
            antes = max(min(meia, folga_antes), min(PAD_ANTES, folga_antes))
        segmentos.append([max(p["s"] - antes, 0.0), p["e"]])
    if segmentos:
        segmentos[-1][1] = P[manter[-1]]["e"] + 0.35  # respiro final

    # encaixa na grade de quadros
    segs = []
    for s, e in segmentos:
        fs, fe = math.floor(s * FPS), math.ceil(e * FPS)
        if segs and fs <= segs[-1][1]:
            segs[-1][1] = max(segs[-1][1], fe)
        else:
            segs.append([fs, fe])

    total_orig = P[-1]["e"] if P else 0
    total_novo = sum(fe - fs for fs, fe in segs) / FPS

    # 5. Relatório legível
    linhas = [
        "# Relatório de cortes",
        "",
        f"Duração falada original: **{total_orig:.1f} s**  →  editada: **{total_novo:.1f} s** ({len(segs)} trechos)",
        "",
        "## O que sai",
        "",
    ]
    grupos: list[tuple[str, list[int]]] = []
    for i in sorted(remover):
        if grupos and grupos[-1][0] == remover[i] and grupos[-1][1][-1] == i - 1:
            grupos[-1][1].append(i)
        else:
            grupos.append((remover[i], [i]))
    for motivo, ids in grupos:
        texto = " ".join(P[i]["w"] for i in ids)
        linhas.append(f"- `{P[ids[0]]['s']:.1f}s` {motivo}: \"{texto}\"")
    if not grupos:
        linhas.append("- Nenhuma palavra removida (só pausas longas foram encurtadas).")
    pausas = sum(1 for k in range(1, len(manter)) if manter[k] == manter[k - 1] + 1 and P[manter[k]]["s"] - P[manter[k - 1]]["e"] > PAUSA_MAX)
    linhas += ["", f"Pausas longas encurtadas: {pausas}", "", "## Texto final", "", " ".join(P[i]["w"] for i in manter)]
    (pasta / "cortes.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    salvar_json(pasta / "cortes.json", {"fps": FPS, "segmentos_quadros": segs, "removidas": {str(k): v for k, v in remover.items()}})
    print("\n".join(linhas[:4]))
    print(f"\nRelatório: {pasta / 'cortes.md'}")

    if not a.aplicar:
        print("\nRevise o relatório. Para gerar o vídeo limpo, rode de novo com --aplicar.")
        return

    # 6. Render: extrai cada trecho, emenda sem perda e normaliza loudness
    exigir_ffmpeg()
    saida = Path(a.saida or pasta / "editado.mp4")
    tmp = Path(tempfile.mkdtemp(prefix="reel_cut_"))
    partes = []
    for n, (fs, fe) in enumerate(segs):
        ini, dur = fs / FPS, (fe - fs) / FPS
        destino = tmp / f"s{n:04d}.mp4"
        rodar([
            "ffmpeg", "-y", "-ss", f"{ini:.4f}", "-i", a.video, "-t", f"{dur:.4f}", "-frames:v", str(fe - fs),
            "-af", f"afade=t=in:st=0:d={FADE},afade=t=out:st={max(dur - FADE, 0):.4f}:d={FADE}",
            "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-g", "30", "-r", str(FPS), "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "256k", "-ar", "48000", str(destino),
        ])
        partes.append(destino)
    lista = tmp / "lista.txt"
    lista.write_text("".join(f"file '{p.as_posix()}'\n" for p in partes), encoding="utf-8")
    unido = tmp / "unido.mp4"
    rodar(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", str(unido)])

    # loudnorm em 2 passagens: -14 LUFS, pico real <= -1 dBTP (padrão Instagram/YouTube)
    r = rodar(["ffmpeg", "-i", str(unido), "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"])
    bloco = r.stderr[r.stderr.rfind("{") : r.stderr.rfind("}") + 1]
    m = json.loads(bloco)
    filtro = (
        f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
        f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    )
    rodar(["ffmpeg", "-y", "-i", str(unido), "-c:v", "copy", "-af", filtro, "-ar", "48000", "-c:a", "aac", "-b:a", "256k", str(saida)])

    # 7. Remapeia as palavras para a nova linha do tempo
    novas, desloc = [], 0.0
    for fs, fe in segs:
        ini, fim = fs / FPS, fe / FPS
        for i in manter:
            p = P[i]
            if p["s"] >= ini - 1e-3 and p["e"] <= fim + 1e-3:
                novas.append({"w": p["w"], "s": round(p["s"] - ini + desloc, 3), "e": round(p["e"] - ini + desloc, 3)})
        desloc += fim - ini
    salvar_json(pasta / "palavras_editadas.json", {"duracao": round(desloc, 3), "palavras": novas})
    print(f"\nPronto: {saida} ({desloc:.1f} s) e {pasta / 'palavras_editadas.json'}")


if __name__ == "__main__":
    main()
