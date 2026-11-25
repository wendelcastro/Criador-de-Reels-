# Criador de Reels em Tela Dividida

Projeto para produzir Reels falados no formato de tela dividida. Use as skills em `.claude/skills/`
(`reel-tela-dividida` é o fluxo completo).

## Regras do projeto

- Todo texto para o usuário e para o vídeo em português do Brasil correto, com acentos, sem travessões
  e sem vocabulário robótico. Frases curtas, com a voz de quem fala.
- Nunca invente número, citação ou resultado. Tudo na tela vem da ficha de fatos do `roteiro.md`.
- Pare para aprovação: roteiro, cortes e render final.
- O contrato de dados entre `pipeline/` e `video/` está em `video/src/types.ts`. Mudou um, mude o outro.
- Antes de mostrar um render, rode `pipeline/verificar.py` e olhe a folha de contato.

- Vídeos novos chegam em `entrada/`. "Editar os vídeos da entrada" = skill `reel-edicao`.
- No Mac/Linux use `python3`; no Windows, `python`.
- Ao terminar um render no computador do usuário, abra o vídeo para ele (`open` no Mac, `start` no Windows).

## Comandos úteis

- Prévia sem gravar: `python pipeline/alinhar.py projetos/<nome> --simular`
- Studio: `cd video && npm run studio`
- Checagem de tipos: `cd video && npx tsc --noEmit`
- Em ambiente sem Chrome do Remotion: `--browser-executable=<caminho do chrome-headless-shell>`
