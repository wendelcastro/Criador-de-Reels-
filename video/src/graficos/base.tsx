import React from 'react';
import {interpolate} from 'remotion';
import {COR, FONTE, FONTE_SERIFA} from '../theme';
import {easeOut, entrada, sobe} from '../anim';

export type GProps<T> = {g: T; t: number; dur: number};

export const Selo: React.FC<{texto: string; p: number; cor?: string}> = ({texto, p, cor = COR.destaque}) => (
  <div
    style={{
      ...sobe(p, 20),
      alignSelf: 'center',
      fontFamily: FONTE,
      fontWeight: 800,
      fontSize: 26,
      letterSpacing: 4,
      textTransform: 'uppercase',
      color: cor,
      padding: '10px 22px',
      borderRadius: 999,
      border: `2px solid ${cor}`,
    }}
  >
    {texto}
  </div>
);

/** Título com uma palavra em serifa itálica, o detalhe editorial que dá cara "premium". */
export const TituloEditorial: React.FC<{texto: string; destaque?: string; tamanho?: number; p: number}> = ({
  texto,
  destaque,
  tamanho = 76,
  p,
}) => {
  const partes = destaque && texto.includes(destaque) ? texto.split(destaque) : [texto];
  return (
    <div
      style={{
        ...sobe(p),
        fontFamily: FONTE,
        fontWeight: 800,
        fontSize: tamanho,
        lineHeight: 1.08,
        letterSpacing: -1.5,
        color: COR.texto,
        textAlign: 'center',
      }}
    >
      {partes[0]}
      {partes.length > 1 && (
        <span style={{fontFamily: FONTE_SERIFA, fontStyle: 'italic', fontWeight: 700, color: COR.destaque}}>
          {destaque}
        </span>
      )}
      {partes[1]}
    </div>
  );
};

export const Rotulo: React.FC<{texto: string; p: number; tamanho?: number; cor?: string}> = ({
  texto,
  p,
  tamanho = 38,
  cor = COR.suave,
}) => (
  <div
    style={{
      ...sobe(p, 24),
      fontFamily: FONTE,
      fontWeight: 600,
      fontSize: tamanho,
      lineHeight: 1.25,
      color: cor,
      textAlign: 'center',
      maxWidth: 860,
    }}
  >
    {texto}
  </div>
);

/** Contador que "rola" até o valor (todo número falado vira contador). */
export const contar = (valor: number, t: number, inicio = 0.1, dur = 0.9, casas = 0) => {
  const p = interpolate(t, [inicio, inicio + dur], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (valor * p).toLocaleString('pt-BR', {minimumFractionDigits: casas, maximumFractionDigits: casas});
};

export const Coluna: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 28}) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap,
      padding: '0 100px',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

export {entrada, sobe};
