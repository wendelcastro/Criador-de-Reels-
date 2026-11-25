// Contrato de dados entre o pipeline (Python) e o motor de render (Remotion).
// Todos os tempos estão em segundos, já na linha do tempo do vídeo EDITADO.

export type Layout = 'full' | 'split' | 'acima' | 'grafico';

export type Palavra = {w: string; s: number; e: number};

export type ItemLista = {texto: string; t?: number};

export type Grafico =
  | {tipo: 'titulo'; selo?: string; titulo: string; destaque?: string; subtitulo?: string}
  | {tipo: 'numero'; valor: number; prefixo?: string; sufixo?: string; rotulo: string; detalhe?: string; casas?: number}
  | {tipo: 'comparativo'; itens: {valor: string; rotulo: string; t?: number}[]; titulo?: string}
  | {tipo: 'donut'; percentual: number; rotulo: string; resto?: string; titulo?: string}
  | {tipo: 'lista'; titulo: string; itens: ItemLista[]; icone?: 'check' | 'alerta' | 'numero'}
  | {tipo: 'citacao'; texto: string; autor: string}
  | {tipo: 'multiplicador'; de: number; para: number; rotulo: string; detalhe?: string}
  | {tipo: 'chips'; titulo: string; itens: string[]}
  | {tipo: 'lema'; linhas: string[]; destaques?: string[]; assinatura?: string}
  | {tipo: 'cta'; acao: string; palavra: string; detalhe?: string};

export type Cena = {
  inicio: number;
  fim: number;
  layout: Layout;
  zoom?: boolean;
  grafico?: Grafico | null;
};

export type ReelProps = {
  video: string; // arquivo dentro de video/public (ex.: "working-with-ai.mp4"); vazio = placeholder
  duracao: number;
  focoY?: number; // 0 a 1, onde fica o rosto no quadro original (padrão 0.38)
  fonte?: string; // crédito exibido no topo
  musica?: string | null;
  volumeMusica?: number;
  destaques?: string[]; // palavras pintadas na cor de destaque nas legendas
  palavras: Palavra[];
  cenas: Cena[];
};
