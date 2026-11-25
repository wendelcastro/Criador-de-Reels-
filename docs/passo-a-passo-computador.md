# Passo a passo no computador

## Antes, uma verdade importante

A **qualidade do Reel vem da gravação**, não de onde ele é editado. A edição sai igual no computador e no app.
O que melhora a imagem é gravar com a **câmera traseira do celular** (bem melhor que qualquer webcam).
O computador ganha em outra coisa: o vídeo passa por AirDrop ou cabo, sem limite de tamanho, e você
pode assistir à prévia animada e mexer na linha do tempo.

**Resumo:** grave no celular, edite no computador.

## Uma vez só: instalar (10 minutos)

### Mac

1. Abra o **Terminal** (Cmd + Espaço, digite "Terminal").
2. Cole estes três comandos, um de cada vez:
   ```bash
   cd ~/Documents && git clone -b claude/exciting-fermi-iwbhra https://github.com/wendelcastro/Criador-de-Reels-.git Reels
   cd Reels && bash scripts/instalar.sh
   claude
   ```
   O instalador coloca o que faltar (FFmpeg, Python, Node e o modelo de voz em português).
   Se o Mac pedir a senha ou para instalar as "ferramentas de linha de comando", aceite.

### Windows

1. Abra o **PowerShell** (tecla Windows, digite "PowerShell").
2. Cole, um de cada vez:
   ```powershell
   cd $HOME\Documents; git clone -b claude/exciting-fermi-iwbhra https://github.com/wendelcastro/Criador-de-Reels-.git Reels
   cd Reels; powershell -ExecutionPolicy Bypass -File scripts\instalar.ps1
   claude
   ```
   Se o `git` não existir, rode antes `winget install Git.Git` e abra o PowerShell de novo.

## A cada vídeo (o fluxo do dia a dia)

**1. Roteiro.** No Claude Code, dentro da pasta `Reels`:
> /reel-tela-dividida faz um Reel sobre [link ou documento]

Você recebe o roteiro, a prévia animada e o link do teleprompter. Aprove ou peça ajustes.

**2. Gravação.** Celular na vertical, câmera traseira, **1080p a 30 fps**, na altura dos olhos.
No iPhone, desligue uma vez o Vídeo HDR (Ajustes > Câmera > Gravar Vídeo).
Teleprompter aberto no notebook logo atrás do celular (o link que o Claude mandar, ou `teleprompter/index.html`).
Grave bloco a bloco. Errou, pausa 2 segundos e recomeça a frase.

**3. Passe os vídeos para o computador.**
- iPhone para Mac: selecione os vídeos no app Fotos, toque em Compartilhar, AirDrop, seu Mac.
- Android ou Windows: cabo USB, ou Google Fotos/Drive e baixe no computador.

Arraste os arquivos para a pasta **`Reels/entrada`**.

**4. Edição.** No Claude Code, escreva:
> editar os vídeos da entrada

O Claude mostra o que vai cortar (citando o que você falou). Você aprova.

**5. Pronto.** O Reel abre sozinho no seu computador. Fica em `Reels/projetos/<nome>/reel.mp4`,
junto com a legenda do post em `post.md`. Mande para o celular (AirDrop) e publique.

## Se algo der errado

| Aconteceu | Faça |
|---|---|
| "command not found: claude" | Instale o Claude Code pelo site oficial e abra o terminal de novo |
| Instalação parou no meio | Rode o instalador de novo; ele continua de onde parou |
| Transcrição lenta | Normal na primeira vez (baixa o modelo). Depois, cerca de 1 a 2 minutos por vídeo |
| Rosto cortado na tela dividida | Diga ao Claude "subir o enquadramento" ou "descer o enquadramento" |
