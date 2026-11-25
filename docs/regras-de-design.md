# Regras de design e edição

Este é o "livro de estilo" do projeto. Ele consolida o que funciona nas melhores skills públicas de edição de
talking head e nas práticas de quem publica vídeo curto profissionalmente. Os números abaixo já estão
implementados no código; mudar uma regra significa mudar o código junto.

## Tela e zonas seguras (1080 x 1920, 30 fps)

- **Topo 220 px, base 420 px e laterais 100 px** ficam embaixo da interface do Instagram/TikTok.
  Texto importante nunca vai ali. O `verificar.py` pinta essas faixas de vermelho na folha de contato.
- Primeiro quadro já composto (é a capa e o que segura a rolagem). Nada de fade do preto.

## Os 4 layouts

| Layout | Apresentador | Esquema | Quando usar |
|---|---|---|---|
| `full` | Tela cheia | Nenhum (só legenda) | Gancho, perguntas, opinião, emoção |
| `split` | Faixa arredondada de 1056 x 960 em y=936 | Metade de cima (y 290 a 870) | Dados, números, citações |
| `acima` | Tela cheia a partir de y=560, topo esfumado | Sobre a cabeça (y 250 a 830) | Títulos, listas, alertas, transições |
| `grafico` | Círculo de 260 px no canto superior direito | Domina a tela | Esquemas que precisam de espaço (multiplicadores, diagramas) |

- Troca de layout: 0,55 s com ease in-out. O esquema da cena nova entra 0,25 s depois da troca.
- Evite três cenas seguidas no mesmo layout. Alterne rosto e dado.
- Linha dourada na costura do split, legenda em pílula sobre a costura.

## Legendas

- Maiúsculas, Montserrat 900, **até 3 palavras ou 18 caracteres por vez**, uma linha só.
- Quebra em pontuação ou pausa de 0,3 s. Nenhuma página dura menos de 0,35 s.
- Karaokê: a palavra acende 40 ms antes de ser falada; as próximas ficam a 45% de opacidade.
- Palavras de `destaques` saem em amarelo (use 8 a 12 por vídeo, só as que carregam a ideia).
- Posição por layout: split na costura (y 936, em pílula), full em y 1290, acima em y 1330, grafico em y 1440.
- Grafia vem do roteiro e tempo vem do Whisper (o `alinhar.py` faz isso sozinho).

## Esquemas

- **Nada aparece antes de ser dito.** Âncora na palavra, entrada no máximo 0,1 s antes.
- Um elemento de cada vez. Itens de lista e cards de comparação entram na palavra que os nomeia.
- Todo número falado vira contador que roda até o valor.
- Título com uma palavra em serifa itálica dourada (o toque editorial). Uma por título, no máximo.
- Tamanhos mínimos: número 160 px ou mais, título 54 px ou mais, texto de apoio 28 px ou mais (já com a escala).
- Crédito da fonte sempre visível no topo das cenas com esquema.

## Movimento

- Entradas de 0,3 a 0,6 s com ease-out cúbico. Nunca linear.
- Saídas mais curtas que entradas (0,2 s).
- Punch-in (zoom de 1,0 para 1,08) só em `full`/`acima`, no máximo 1 a cada 8 s. Mais que isso cansa.
- Nada pulsando em loop, nada balançando em sincronia.
- Alguma mudança visual a cada 2 a 4 s (legenda conta, mas troque de cena ou revele item a cada 4 a 8 s).

## Cortes de fala

- Corte só entre palavras. 50 ms de respiro antes, 80 ms depois. Fade de 30 ms em cada emenda.
- Pausas acima de 0,8 s viram cerca de 0,3 s (0,45 s no fim de frase). Pausa nunca vira zero.
- Hesitações puras (hã, ãh, hum, eh, "é..." arrastado) saem sempre.
- Muletas (tipo, né, então, aí) só saem com `--agressivo` e quando isoladas por pausa.
- Tomada repetida: fica a última tentativa completa. Nunca costurar pedaços de tentativas diferentes.

## Áudio e entrega

- Loudness integrado de -14 LUFS, pico real abaixo de -1 dBTP (normalização em 2 passagens).
- Trilha, se houver, a 0,08 de volume (algo entre -20 e -24 dB abaixo da voz).
- H.264, CRF 18, yuv420p, 30 fps, AAC 48 kHz. Duração ideal de 60 a 90 s.

## De onde vieram estas regras

| Fonte pública | O que aproveitamos |
|---|---|
| browser-use/video-use (MIT) | Fluxo com aprovação antes de cortar, cortes só entre palavras, padding de 50/80 ms, fade de 30 ms, loudness -14 LUFS em 2 passagens, autoavaliação em até 3 rodadas |
| artemnovitckii/claude-editing-skills (MIT) | Geometria do split (costura perto de y 918 a 936), legenda em pílula na costura, zonas seguras, âncora de esquema na palavra, palavra em serifa itálica no título |
| kevinbadi/open-edits (MIT) | Faixa do apresentador com cantos arredondados e margens de 12 px, contador em todo número, quadro 0 já composto, punch-ins raros |
| heygen-com/hyperframes, talking-head-recut (Apache-2.0) | Os layouts split/stack/pip, transição de 0,5 a 0,7 s entre layouts, densidade de cards por duração, Whisper com idioma explícito (sem `.en`) |
| chatcut-inc/agent-plugin, talking-head-guide (Apache-2.0) | Regras de hesitação vs. muleta, "última tomada completa vence", pausas comprimidas e não zeradas, explicar cortes citando a fala |
| remotion-dev/skills | Animação só por `useCurrentFrame`/`interpolate`, um foco por cena, tamanhos mínimos de texto |
| digitalsamba/claude-code-video-toolkit (MIT) | Legenda com a grafia do roteiro sobre o tempo do Whisper, checagem automática de qualidade, ritmo de 140 a 170 ppm |
