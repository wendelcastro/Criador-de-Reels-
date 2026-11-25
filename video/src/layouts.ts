import {Layout} from './types';
import {H, W} from './theme';

export type Caixa = {x: number; y: number; w: number; h: number; r: number; mascara: number};

// Geometria da "janela" do apresentador em cada layout (1080x1920).
// split: gráficos em cima (0 a ~900), apresentador numa faixa arredondada embaixo.
// acima: apresentador quase em tela cheia, com o topo esfumado para os esquemas
//        aparecerem "acima da cabeça".
// grafico: esquema domina a tela; apresentador vira um círculo (PiP).
export const CAIXAS: Record<Layout, Caixa> = {
  full: {x: 0, y: 0, w: W, h: H, r: 0, mascara: 0},
  split: {x: 12, y: 936, w: W - 24, h: 960, r: 48, mascara: 0},
  acima: {x: 0, y: 560, w: W, h: H - 560, r: 0, mascara: 1},
  grafico: {x: 740, y: 250, w: 260, h: 260, r: 130, mascara: 0},
};

// Área onde o gráfico de cada layout é desenhado.
export const AREA_GRAFICO: Record<Layout, {top: number; height: number}> = {
  full: {top: 0, height: 0},
  split: {top: 290, height: 580},
  acima: {top: 250, height: 580},
  grafico: {top: 560, height: 760},
};

// Posição vertical (centro) das legendas em cada layout.
export const Y_LEGENDA: Record<Layout, number> = {
  full: 1290,
  split: 936,
  acima: 1330,
  grafico: 1440,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const misturar = (a: Caixa, b: Caixa, t: number): Caixa => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
  mascara: lerp(a.mascara, b.mascara, t),
});
