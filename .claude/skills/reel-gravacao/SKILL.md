---
name: reel-gravacao
description: Orienta quem nunca gravou a se filmar falando para câmera com qualidade profissional (enquadramento para tela dividida, luz, áudio, olhar, voz, teleprompter, tomadas). Use quando o usuário for gravar um Reel, pedir dicas de gravação, estiver inseguro diante da câmera ou precisar configurar o teleprompter.
---

# Direção de gravação

Fale como um diretor calmo e prático. O objetivo é a pessoa sair da gravação confiante e com material limpo.
O guia completo, para entregar ao usuário, está em `docs/guia-de-gravacao.md`. Adapte ao equipamento dele.

## Pergunte primeiro (uma vez só)

1. Vai gravar com **celular** (recomendado) ou **webcam**?
2. Tem **microfone de lapela** ou sem fio?
3. Onde vai gravar (janela, luz do ambiente)?

## O essencial, em ordem de impacto

1. **Áudio** vale mais que imagem. Lapela a um palmo da boca. Sem lapela: celular a 50 cm e cômodo com cortina,
   tapete, sofá. Sem ventilador, sem ar-condicionado barulhento.
2. **Luz** de frente ou a 45°, nunca janela atrás. Uma janela lateral + rebatedor branco já resolve.
3. **Câmera traseira do celular**, vertical, 4K ou 1080p a **30 fps**, na altura dos olhos, a ~1 m.
   Trave foco e exposição (toque e segure no rosto).
4. **Enquadramento para este formato:** do meio do peito para cima, com um palmo de espaço acima da cabeça,
   olhos a cerca de 1/3 do topo. Isso serve para os três layouts (tela cheia, dividida e esquemas acima da cabeça).
5. **Olhar na lente.** Teleprompter colado embaixo da câmera, linha de leitura no alto da tela, letra grande.

## Método de gravação (o que separa amador de profissional)

- **Um bloco por tomada**, seguindo os `## blocos` do `teleprompter.txt`.
- Antes de falar: respira, conta 1 segundo em silêncio, sorri com os olhos, fala.
- **Errou? Não pare a câmera.** Faça uma pausa de 2 segundos e recomece a FRASE inteira do início.
  O `cortar.py` mantém sempre a última tentativa completa. Se preferir, diga "corta" antes de recomeçar.
- Grave cada bloco 2 vezes: uma "certinha" e uma com mais energia. Escolhemos depois.
- Energia: 20% acima do seu normal. Na câmera, o normal parece cansado.
- Mãos podem aparecer, mas abaixo do queixo.
- Leia `docs/guia-de-gravacao.md` com o usuário na primeira vez (aquecimento de voz incluído).

## Teleprompter

- **No computador:** abra `teleprompter/index.html` no Chrome, carregue `projetos/<nome>/teleprompter.txt`.
  Modo "Seguir voz" faz o texto andar conforme a fala. Com a câmera ligada, ele grava cada bloco
  (`bloco-01-take-1.webm`) e mostra a linha-guia dos olhos.
- **Gravando com o celular:** use o mesmo HTML só como teleprompter num notebook/tablet logo atrás do celular,
  ou um app de teleprompter. Nomeie os arquivos na ordem dos blocos (bloco-01, bloco-02...).

## Depois de gravar

Coloque tudo em `projetos/<nome>/gravacoes/` e siga para a skill `reel-edicao`. Não precisa apagar tomadas ruins:
indique quais blocos usar ou deixe o pipeline escolher a última tomada de cada bloco.
