import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Palavra} from '../types';
import {COR, FONTE} from '../theme';
import {easeOut} from '../anim';

// Regras (consolidadas de video-use, claude-editing-skills e HyperFrames):
// até 3 palavras ou 18 caracteres por página, quebra em pontuação ou pausa >= 0,3 s,
// página nunca dura menos de 0,35 s, palavra acende 40 ms antes de ser falada.
const MAX_PALAVRAS = 3;
const MAX_CHARS = 18;
const PAUSA_QUEBRA = 0.3;
const MIN_PAGINA = 0.35;
const ANTECIPA = 0.04;

type Pagina = {palavras: Palavra[]; s: number; e: number};

const normal = (w: string) =>
  w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%]/g, '');

export const paginar = (palavras: Palavra[]): Pagina[] => {
  const paginas: Pagina[] = [];
  let atual: Palavra[] = [];
  const fechar = () => {
    if (!atual.length) return;
    paginas.push({palavras: atual, s: atual[0].s, e: atual[atual.length - 1].e});
    atual = [];
  };
  palavras.forEach((p, i) => {
    const texto = [...atual, p].map((x) => x.w.trim()).join(' ');
    if (atual.length && (atual.length >= MAX_PALAVRAS || texto.length > MAX_CHARS)) fechar();
    atual.push(p);
    const prox = palavras[i + 1];
    const pontuacao = /[.,!?;:…]$/.test(p.w.trim());
    if (!prox || pontuacao || prox.s - p.e >= PAUSA_QUEBRA) fechar();
  });
  // duração mínima e sem sobreposição
  paginas.forEach((pg, i) => {
    const prox = paginas[i + 1];
    const fimDesejado = Math.max(pg.e + 0.12, pg.s + MIN_PAGINA);
    pg.e = prox ? Math.min(fimDesejado, prox.s) : fimDesejado;
  });
  return paginas;
};

export const Legendas: React.FC<{palavras: Palavra[]; destaques: string[]; y: number; estilo: 'pilula' | 'livre'}> = ({
  palavras,
  destaques,
  y,
  estilo,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const paginas = useMemo(() => paginar(palavras), [palavras]);
  const alvo = useMemo(() => new Set(destaques.map(normal)), [destaques]);

  const pagina = paginas.find((p) => t >= p.s - ANTECIPA && t < p.e);
  if (!pagina) return null;

  const pop = interpolate(t, [pagina.s - ANTECIPA, pagina.s + 0.1], [0.88, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const tamanho = estilo === 'pilula' ? 58 : 72;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(-50%) scale(${pop})`,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: estilo === 'pilula' ? 16 : 28,
          flexWrap: 'nowrap',
          padding: estilo === 'pilula' ? '18px 34px' : 0,
          borderRadius: 999,
          background: estilo === 'pilula' ? 'rgba(10,15,30,0.92)' : 'transparent',
          border: estilo === 'pilula' ? `2px solid ${COR.borda}` : 'none',
          boxShadow: estilo === 'pilula' ? '0 12px 40px rgba(0,0,0,0.45)' : 'none',
          maxWidth: 940,
        }}
      >
        {pagina.palavras.map((p, i) => {
          const falada = t >= p.s - ANTECIPA;
          const ativa = falada && t < p.e + 0.05;
          const ehDestaque = alvo.has(normal(p.w));
          return (
            <span
              key={i}
              style={{
                fontFamily: FONTE,
                fontWeight: 900,
                fontSize: tamanho,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                letterSpacing: -0.5,
                color: ehDestaque ? COR.destaque : COR.texto,
                opacity: falada ? 1 : 0.45,
                transform: `translateY(${ativa ? -4 : 0}px)`,
                WebkitTextStroke: estilo === 'livre' ? '8px rgba(0,0,0,0.85)' : undefined,
                paintOrder: 'stroke fill',
                textShadow: estilo === 'livre' ? '0 6px 24px rgba(0,0,0,0.5)' : undefined,
                whiteSpace: 'nowrap',
              }}
            >
              {p.w.replace(/[,;:]$/, '')}
            </span>
          );
        })}
      </div>
    </div>
  );
};
