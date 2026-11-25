// Fontes embutidas (funcionam offline, sem depender do Google Fonts no render).
import '@fontsource/montserrat/latin-500.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/montserrat/latin-900.css';
import '@fontsource/montserrat/latin-ext-700.css';
import '@fontsource/montserrat/latin-ext-900.css';
import '@fontsource/playfair-display/latin-700-italic.css';

export const FONTE = "'Montserrat', sans-serif";
export const FONTE_SERIFA = "'Playfair Display', serif";

// Paleta sóbria e editorial. Troque aqui para aplicar a sua identidade visual.
export const COR = {
  fundo: '#0A0F1E',
  fundo2: '#121A30',
  painel: 'rgba(255,255,255,0.06)',
  borda: 'rgba(255,255,255,0.12)',
  texto: '#F5F7FB',
  suave: 'rgba(245,247,251,0.68)',
  destaque: '#FFC24A',
  secundaria: '#5B9BFF',
  alerta: '#FF6B5B',
};

export const W = 1080;
export const H = 1920;

// Zonas seguras do Instagram/TikTok em 1080x1920 (UI cobre essas áreas).
export const SEGURO = {topo: 220, base: 420, lado: 100};
