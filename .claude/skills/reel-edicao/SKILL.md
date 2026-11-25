---
name: reel-edicao
description: Edita a gravação de um Reel falado. Transcreve localmente com timestamp por palavra, remove hesitações, tomadas repetidas e pausas longas, sincroniza esquemas animados com a fala, aplica legendas animadas palavra por palavra, monta tela dividida/esquemas acima da cabeça e renderiza em 1080x1920 com áudio em -14 LUFS. Use quando houver vídeo gravado para editar no formato de tela dividida.
---

# Edição e render

Ordem obrigatória: **primeiro o tempo da fala (cortes), depois esquemas e legendas.** Tudo se apoia nos
timestamps da linha do tempo já editada.

## Parte A. Limpeza da fala

```bash
P=projetos/<nome>
# 1. padroniza (1080x1920, 30 fps, GOP 30, áudio 48 kHz) e junta as tomadas na ordem
python pipeline/preparar.py $P/gravacoes/ -o $P/bruto.mp4
#    (para escolher tomadas: liste os arquivos na ordem desejada em vez da pasta)
# 2. transcreve local, palavra por palavra, mantendo os "hã" e "é..."
python pipeline/transcrever.py $P/bruto.mp4 -o $P/transcricao.json --roteiro $P/teleprompter.txt --modelo medium
# 3. proposta de cortes (NÃO renderiza)
python pipeline/cortar.py $P/bruto.mp4 $P/transcricao.json --roteiro $P/teleprompter.txt
```

Mostre ao usuário um resumo de `cortes.md` **citando a fala** (nunca índices). Confira você mesmo:
- O "Texto final" deve bater com o roteiro. Se sobrou frase duplicada ou faltou uma frase, ajuste:
  rode com `--agressivo` para muletas isoladas, ou edite `transcricao.json` (apague a tomada ruim) e rode de novo.
- Duração editada acima de 95 s? Sugira o que cortar do roteiro.

Depois da aprovação:
```bash
python pipeline/cortar.py $P/bruto.mp4 $P/transcricao.json --roteiro $P/teleprompter.txt --aplicar
```
Gera `editado.mp4` (emendas com fade de 30 ms, -14 LUFS, pico -1 dBTP) e `palavras_editadas.json`.

## Parte B. Montagem

```bash
python pipeline/alinhar.py $P --video $P/editado.mp4      # gera $P/props.json e copia o vídeo para video/public
```
Leia a tabela impressa. Resolva todo `[aviso]`:
- âncora fraca ou não encontrada → ajuste a `ancora` no `cenas.plan.json` para o que foi realmente falado;
- cena "curta demais" (< 1,2 s) → junte com a vizinha; "longa" (> 9 s com esquema) → divida ou use `lista`/`comparativo` com âncoras nos itens.

Prévia de quadros (rápido) e conferência do enquadramento:
```bash
cd video
npx remotion still Reel out/q1.png --frame=60 --props=../$P/props.json
npm run studio      # o usuário pode ver animado e arrastar a linha do tempo
```
Rosto cortado no split? Ajuste `focoY` no `cenas.plan.json` (0,30 sobe o quadro, 0,45 desce) e realinhe.

## Parte C. Render e checagem

```bash
cd video && npx remotion render Reel ../$P/reel.mp4 --props=../$P/props.json
cd .. && python pipeline/verificar.py $P/reel.mp4
```
Abra a folha `reel_verificacao.png` e confira, nesta ordem:
1. Legenda, números e rosto fora das faixas vermelhas (interface do Instagram).
2. O esquema de cada cena entra junto da palavra (abra o Studio nos inícios de cena se tiver dúvida).
3. Grafia das legendas (o `alinhar.py` já usa a grafia do roteiro, mas confira nomes próprios).
4. Todos os checks de `verificar.py` em OK.

No máximo 3 rodadas de correção. Depois disso, mostre o vídeo e liste o que ainda pode melhorar.

## Ajustes finos comuns

| Pedido | Onde mexer |
|---|---|
| Cores e fontes da marca | `video/src/theme.ts` |
| Posição da legenda | `Y_LEGENDA` em `video/src/layouts.ts` |
| Tamanho da faixa do apresentador | `CAIXAS.split` em `video/src/layouts.ts` |
| Trilha sonora | coloque o mp3 em `video/public/` e `"musica": "trilha.mp3"` no `cenas.plan.json` (volume 0,08) |
| Novo tipo de esquema | `video/src/graficos/Graficos.tsx` + tipo em `types.ts` + `docs/catalogo-de-graficos.md` |
