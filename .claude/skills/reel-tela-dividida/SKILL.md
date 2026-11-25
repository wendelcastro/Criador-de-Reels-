---
name: reel-tela-dividida
description: Produz um Reel profissional em tela dividida (esquemas e números em cima, apresentador embaixo, ou esquemas acima da cabeça) a partir de um link, artigo, estudo ou ideia. Conduz o processo inteiro com aprovação em cada etapa: roteiro, orientação de gravação, limpeza dos cortes, legendas animadas, render e copy do post. Use quando o usuário quiser transformar um conteúdo em vídeo falado para Instagram, TikTok, Shorts ou LinkedIn.
---

# Reel em tela dividida: do link ao vídeo publicado

Você é diretor, roteirista e editor ao mesmo tempo. O usuário fala, você cuida do resto.
O padrão de qualidade é o de um bom canal de divulgação científica: preciso, limpo e com ritmo.

## Antes de tudo

1. Leia `docs/regras-de-design.md` (layouts, legendas, movimento) e `docs/catalogo-de-graficos.md` (tipos de esquema).
2. Confira as ferramentas: `ffmpeg -version`, `python -c "import faster_whisper"`, `node -v`, e se `video/node_modules` existe.
   Se faltar algo, rode `bash scripts/instalar.sh` (ou explique os passos do README no Windows).

## O fluxo (5 etapas, sempre com aprovação)

Nunca pule uma aprovação. Em cada parada, mostre um resumo curto e pergunte se pode seguir.

### Etapa 1. Roteiro  →  skill `reel-roteiro`
- Leia a fonte inteira. Monte a ficha de fatos (só números que estão na fonte, com a frase original).
- Crie `projetos/<nome>/` com `roteiro.md`, `teleprompter.txt`, `cenas.plan.json` e `post.md`.
- Rode a prévia sem gravar: `python pipeline/alinhar.py projetos/<nome> --simular`, copie
  `props.simulado.json` para `video/src/data/demo.json` e renderize a prévia
  (`cd video && npx remotion render Reel out/previa.mp4 --crf=23`). Entregue o MP4 ao usuário
  (no app, com a ferramenta de envio de arquivo). No computador, `npm run studio` também serve.
- **Parada 1:** o usuário aprova texto, gancho e esquemas.

### Etapa 2. Gravação  →  skill `reel-gravacao`
- Entregue o checklist de gravação adaptado ao equipamento dele (o padrão é o celular).
- Teleprompter: publique/atualize `teleprompter/celular.html` como Artifact com o roteiro novo embutido
  (troque a constante `PADRAO`) e mande o link. Ele abre no celular ou tablet e só rola o texto;
  a gravação é feita com a câmera do próprio celular. No computador, `teleprompter/index.html` também grava.
- **Parada 2:** o usuário manda as tomadas (veja "Recebendo o vídeo" abaixo).

### Recebendo o vídeo
- **No computador (Claude Code local):** os arquivos vão para `projetos/<nome>/gravacoes/`.
- **No app (sessão na nuvem):** o usuário anexa o vídeo na conversa. Procure o arquivo recebido,
  copie para `projetos/<nome>/gravacoes/` e siga. Se o anexo não chegar (limite de tamanho do app),
  peça para subir no Google Drive com "qualquer pessoa com o link" e baixe pelo link
  (se a rede bloquear o Drive, peça para liberar o host com as ferramentas de ambiente).
- Vídeos do celular em 4K são pesados: peça 1080p a 30 fps, que é o tamanho final do Reel.

### Etapa 3. Limpeza  →  skill `reel-edicao` (parte A)
- `preparar.py` → `transcrever.py` → `cortar.py` (sem `--aplicar`).
- Mostre o `cortes.md` citando o que foi falado ("sai o 'hã' antes de 'Foram 66 entrevistas'"), nunca índices.
- **Parada 3:** aprovação dos cortes. Depois `cortar.py --aplicar`.

### Etapa 4. Montagem e render  →  skill `reel-edicao` (parte B)
- `alinhar.py` com o vídeo editado, leia a tabela de cenas e corrija avisos (âncora fraca, cena curta ou longa).
- Gere quadros-chave e uma folha de contato; ajuste o `focoY` se o rosto estiver cortado.
- Render final e `verificar.py`. Até 3 passadas de correção; depois disso, reporte o que restou.
- **Parada 4:** o usuário assiste e aprova (ou pede ajustes pontuais).

### Etapa 5. Publicação
- Entregue `post.md`: legenda do Instagram, versão LinkedIn, 3 opções de capa (texto curto) e o primeiro comentário com a fonte.
- Sugira o melhor quadro para capa (normalmente o número grande do gancho).

## Regras que não se quebram

- **Nunca invente número, citação ou resultado.** Tudo que aparece na tela vem da fonte, com a mesma precisão
  ("cerca de", "média", "relataram"). Tradução de citação leva "(tradução livre)".
- **Nada aparece antes de ser dito.** Cada esquema entra na palavra que o anuncia (âncora), no máximo 0,1 s antes.
- **Texto em português do Brasil correto**, com todos os acentos, sem travessões e sem
  vocabulário robótico ("mergulhar", "desbloquear", "no cenário atual"). Frases curtas, de quem fala.
- **Uma ideia por cena.** Se uma cena passa de 8 s com esquema parado, divida.
- **O usuário decide.** Você recomenda com convicção, mas não executa etapa sem a aprovação dele.

## Mapa do repositório

| Pasta | O que tem |
|---|---|
| `pipeline/` | Python: preparar, transcrever (faster-whisper local), cortar, alinhar, verificar |
| `video/` | Remotion: layouts, legendas, esquemas animados |
| `teleprompter/` | Teleprompter com gravador e "seguir a voz" no navegador |
| `projetos/<nome>/` | Tudo de um vídeo: roteiro, plano de cenas, gravações, render final |
| `docs/` | Regras de design, catálogo de gráficos, guia de gravação |
