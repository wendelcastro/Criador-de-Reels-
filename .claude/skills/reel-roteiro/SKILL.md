---
name: reel-roteiro
description: Escreve o roteiro falado de um Reel (60 a 90 s) a partir de um link, estudo ou ideia, já com o plano de esquemas visuais sincronizados com a fala, o arquivo de teleprompter e a copy do post. Use quando o usuário pedir roteiro para vídeo curto, Reels, TikTok ou Shorts, sobretudo no formato de tela dividida.
---

# Roteiro de Reel com plano visual

## 1. Ficha de fatos (antes de escrever uma linha)

Leia a fonte inteira e monte, no topo do `roteiro.md`, uma tabela:

| Dado | Como está na fonte | Onde |
|---|---|---|

Regras: só entra o que está escrito. Guarde as ressalvas ("amostra não representativa", "autodeclarado",
"média de 6 startups"). Se a página não carregar inteira, diga isso e não preencha lacunas de memória.

## 2. Estrutura (60 a 90 s, 150 a 170 palavras por minuto)

| Bloco | Tempo | Função |
|---|---|---|
| Gancho | 0 a 3 s | Número ou contradição. Nada de "oi, pessoal" nem "neste vídeo". |
| Contexto | 3 a 10 s | Quem, quantos, por que confiar. |
| 2 a 4 achados | 10 a 60 s | Um por bloco, cada um com um esquema. |
| Virada | 60 a 75 s | O ponto que ninguém está olhando. É aqui que entra a opinião do autor. |
| Fecho e CTA | últimos 8 s | Frase-assinatura + uma ação só ("comenta ESTUDO"). |

Gancho: escreva 3 opções no `roteiro.md` (número forte, contradição, pergunta direta) e recomende uma.

## 3. Texto falado

- Português do Brasil impecável, com acentos. Releia procurando erro de concordância e acento.
- Frases de 6 a 14 palavras. Uma ideia por frase. Ponto final é pausa de respiração.
- Escreva como a pessoa fala: "a gente", "olha só", contrações naturais. Nada de travessão e nada de
  "no cenário atual", "mergulhar", "desbloquear", "revolucionar", "é importante ressaltar".
- Números: escreva com algarismos no teleprompter ("66 entrevistas") e evite começar a âncora de uma cena com número.
- Marque ênfases no `roteiro.md` com **negrito** (não no teleprompter).

## 4. Arquivos que você entrega em `projetos/<nome>/`

1. **`roteiro.md`**: ficha de fatos, 3 ganchos, roteiro por bloco com direção de cena
   (tom, onde sorrir, onde pausar, layout de cada trecho) e duração estimada.
2. **`teleprompter.txt`**: só o texto falado. Cada bloco começa com `## Título`. Um bloco = uma tomada.
3. **`cenas.plan.json`**: plano visual. Veja `docs/catalogo-de-graficos.md`. Formato:
   ```json
   {"projeto": "nome", "fonte": "Fonte: ...", "focoY": 0.38,
    "destaques": ["palavras", "em", "amarelo", "na", "legenda"],
    "cenas": [{"ancora": "primeiras palavras da fala", "layout": "split", "grafico": {"tipo": "numero", "...": "..."}}]}
   ```
   - `ancora`: 3 a 5 palavras exatamente como serão faladas, em minúsculas. A primeira cena começa no 0.
   - Alterne layouts para manter ritmo: `full` (rosto, emoção, perguntas), `split` (dados), `acima`
     (esquema sobre a cabeça), `grafico` (esquema domina, rosto em círculo). Evite 3 iguais seguidos.
   - Use `zoom: true` só em `full`/`acima`, no máximo 1 a cada 8 s.
   - Itens de `lista` e `comparativo` podem ter `ancora` própria para entrarem na palavra.
4. **`post.md`**: legenda do Instagram (gancho na 1ª linha, 3 a 5 parágrafos curtos, fonte, CTA, 3 a 5 hashtags),
   versão LinkedIn (mais analítica, primeira pessoa), 3 textos de capa (até 5 palavras) e primeiro comentário com o link.

## 5. Prévia antes de gravar

```bash
python pipeline/alinhar.py projetos/<nome> --simular
cp projetos/<nome>/props.simulado.json video/src/data/demo.json
cd video && npm run studio        # ou: npx remotion still Reel out/q.png --frame=90
```
Corrija avisos de âncora e cenas longas antes de mostrar ao usuário.
