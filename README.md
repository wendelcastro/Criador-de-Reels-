# Criador de Reels em Tela Dividida

Transforma um link, estudo ou ideia num Reel profissional: **esquemas e números animados em cima, você
falando embaixo**, ou os esquemas flutuando acima da sua cabeça. O Claude escreve o roteiro, te orienta na
gravação, limpa os erros e as pausas, sincroniza cada esquema com a palavra exata, coloca legenda animada e
entrega o vídeo pronto em 1080 x 1920, com a copy do post.

Tudo local e gratuito: transcrição com Whisper na sua máquina, edição com FFmpeg, animação com Remotion.
Nenhuma chave de API é necessária.

## Como funciona

```
 link/estudo ──► /reel-roteiro ──► prévia animada ──► você grava ──► /reel-edicao ──► reel.mp4 + post
                 (fatos, texto,     (antes de gravar,   (teleprompter    (cortes, legendas,
                  plano visual)      para aprovar)       bloco a bloco)   esquemas, render)
```

Em cada etapa o Claude para e pede a sua aprovação.

| Skill | Para quê |
|---|---|
| `/reel-tela-dividida` | O fluxo completo, do link ao vídeo publicado |
| `/reel-roteiro` | Só o roteiro, o plano de esquemas e a copy do post |
| `/reel-gravacao` | Direção de gravação para quem nunca gravou |
| `/reel-edicao` | Edição de um vídeo já gravado |

## Instalação (uma vez)

**Guia sem atrito, com Mac e Windows: [`docs/passo-a-passo-computador.md`](docs/passo-a-passo-computador.md).**


Pré-requisitos: **Python 3.10+**, **Node 18+** e **FFmpeg**.

- macOS: `brew install ffmpeg python node`
- Windows: `winget install Gyan.FFmpeg Python.Python.3.12 OpenJS.NodeJS.LTS`
- Linux: `sudo apt install ffmpeg python3-pip nodejs npm`

Depois, na pasta do projeto:

```bash
bash scripts/instalar.sh          # macOS/Linux
# Windows (PowerShell): pip install -r pipeline/requirements.txt ; cd video ; npm install
```

Para usar as skills em qualquer pasta, copie-as para a sua pasta pessoal do Claude Code:

```bash
cp -r .claude/skills/* ~/.claude/skills/
```

Dentro deste repositório elas já funcionam sem copiar.

## Uso

Abra o Claude Code nesta pasta e peça, por exemplo:

> /reel-tela-dividida Quero um Reel sobre https://www.anthropic.com/research/working-with-ai

### O caminho manual (o que o Claude roda por você)

```bash
P=projetos/meu-video

# 0. prévia antes de gravar
python pipeline/alinhar.py $P --simular
cp $P/props.simulado.json video/src/data/demo.json && (cd video && npm run studio)

# 1. gravar: abra teleprompter/index.html no Chrome e grave bloco a bloco em $P/gravacoes/

# 2. limpar a fala
python pipeline/preparar.py $P/gravacoes/ -o $P/bruto.mp4
python pipeline/transcrever.py $P/bruto.mp4 -o $P/transcricao.json --roteiro $P/teleprompter.txt
python pipeline/cortar.py $P/bruto.mp4 $P/transcricao.json --roteiro $P/teleprompter.txt            # revisar cortes.md
python pipeline/cortar.py $P/bruto.mp4 $P/transcricao.json --roteiro $P/teleprompter.txt --aplicar

# 3. montar, renderizar e checar
python pipeline/alinhar.py $P --video $P/editado.mp4
(cd video && npx remotion render Reel ../$P/reel.mp4 --props=../$P/props.json)
python pipeline/verificar.py $P/reel.mp4
```

## Estrutura

```
.claude/skills/     as 4 skills
docs/               regras de design, catálogo de esquemas, guia de gravação
pipeline/           preparar, transcrever, cortar, alinhar, verificar (Python + FFmpeg)
teleprompter/       teleprompter com gravador e "seguir a voz" (abre no navegador)
video/              motor de render (Remotion + React)
projetos/           uma pasta por vídeo; working-with-ai/ é o primeiro, pronto para gravar
```

## Primeiro projeto pronto: "Working with AI"

`projetos/working-with-ai/` já tem roteiro com ficha de fatos, texto do teleprompter, plano de 21 cenas e
a copy do post (Instagram e LinkedIn). Falta só você gravar.

## O que foi aproveitado das skills públicas

Pesquisamos as principais skills abertas de edição de vídeo falado e trouxemos o melhor de cada uma
(detalhes em `docs/regras-de-design.md`):

- **browser-use/video-use**: aprovação antes de cortar, cortes só entre palavras, fades de 30 ms, loudness em 2 passagens.
- **artemnovitckii/claude-editing-skills**: geometria do split, legenda em pílula na costura, âncora do esquema na palavra.
- **kevinbadi/open-edits**: faixa do apresentador com cantos arredondados, contador em todo número, primeiro quadro já composto.
- **heygen-com/hyperframes**: layouts split, acima e PiP com transição suave; Whisper com idioma explícito.
- **chatcut-inc talking-head-guide**: hesitação x muleta, "a última tomada completa vence", pausas comprimidas sem zerar.
- **remotion-dev/skills** e **digitalsamba/claude-code-video-toolkit**: boas práticas de animação, legenda com a grafia do roteiro, checagem automática.

Diferenciais deste repositório: tudo em português, transcrição 100% local, roteiro com ficha de fatos,
prévia animada antes de gravar, teleprompter que grava e segue a sua voz, e checagem final de qualidade.

## Licenças

O código deste repositório é seu. O **Remotion** é gratuito para pessoas físicas e empresas com até 3
funcionários; empresas maiores precisam de licença comercial (veja remotion.dev/license). O
**faster-whisper** é MIT. Os modelos do Whisper são MIT.
