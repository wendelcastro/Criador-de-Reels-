import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cena, ReelProps} from './types';
import {COR, FONTE, H, W} from './theme';
import {easeInOut, easeOut} from './anim';
import {AREA_GRAFICO, CAIXAS, misturar, Y_LEGENDA} from './layouts';
import {Legendas} from './components/Legendas';
import {RenderGrafico} from './graficos/Graficos';

const ALTURA_PALCO = 700;
const TRANSICAO = 0.55; // troca de layout: 0,5 a 0,7 s com ease in-out

const cenaAtual = (cenas: Cena[], t: number) => {
  let i = cenas.findIndex((c) => t >= c.inicio && t < c.fim);
  if (i < 0) i = t < (cenas[0]?.inicio ?? 0) ? 0 : cenas.length - 1;
  return i;
};

const Fundo: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 70% at 50% 0%, ${COR.fundo2} 0%, ${COR.fundo} 60%)`,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 55%)',
      }}
    />
  </AbsoluteFill>
);

const Placeholder: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#2A3350,#151B2E)', alignItems: 'center', justifyContent: 'flex-end'}}>
    <svg width={760} height={1100} viewBox="0 0 760 1100" style={{marginBottom: -40, opacity: 0.55}}>
      <circle cx={380} cy={330} r={170} fill="#8EA0C8" />
      <path d="M40 1100 C40 720 200 560 380 560 C560 560 720 720 720 1100 Z" fill="#8EA0C8" />
    </svg>
    <div style={{position: 'absolute', top: '42%', fontFamily: FONTE, fontWeight: 800, fontSize: 40, color: '#fff', opacity: 0.8}}>
      SEU VÍDEO AQUI
    </div>
  </AbsoluteFill>
);

// Garante que as fontes carregaram antes de qualquer quadro ser fotografado.
const useFontes = () => {
  const [handle] = useState(() => delayRender('Carregando fontes'));
  useEffect(() => {
    const pesos = ['500', '600', '700', '800', '900'];
    Promise.all([
      ...pesos.map((p) => document.fonts.load(`${p} 40px Montserrat`, 'ÁÉÍÓÚÇãõ 0123')),
      document.fonts.load('italic 700 40px "Playfair Display"'),
    ])
      .then(() => document.fonts.ready)
      .finally(() => continueRender(handle));
  }, [handle]);
};

export const Reel: React.FC<ReelProps> = (props) => {
  useFontes();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {cenas} = props;
  const i = cenaAtual(cenas, t);
  const cena = cenas[i];
  const anterior = cenas[i - 1];
  const tCena = t - cena.inicio;

  // Caixa do apresentador com transição suave entre layouts.
  const pTrans = anterior
    ? interpolate(tCena, [0, TRANSICAO], [0, 1], {easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  const caixa = misturar(CAIXAS[anterior?.layout ?? cena.layout], CAIXAS[cena.layout], pTrans);

  // Punch-in discreto (máx. 1,08), só quando a cena pede e o rosto está grande.
  const zoom =
    cena.zoom && (cena.layout === 'full' || cena.layout === 'acima')
      ? interpolate(tCena, [0, 0.35], [1, 1.08], {easing: easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : 1;

  const focoY = Math.round((props.focoY ?? 0.38) * 100);
  const m = caixa.mascara;
  const mascara = m > 0.01 ? `linear-gradient(to bottom, rgba(0,0,0,${1 - m}) 0px, black ${Math.round(m * 320)}px)` : undefined;

  // Gráfico: entra no início da cena e sai nos últimos 0,2 s.
  const temGrafico = cena.grafico && cena.layout !== 'full';
  const area = AREA_GRAFICO[cena.layout];
  const dur = cena.fim - cena.inicio;
  const saida = interpolate(t, [cena.fim - 0.2, cena.fim], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mesmaProx = cenas[i + 1]?.grafico && JSON.stringify(cenas[i + 1].grafico) === JSON.stringify(cena.grafico);
  const atrasoEntrada = anterior && anterior.layout !== cena.layout ? 0.25 : 0;

  return (
    <AbsoluteFill style={{width: W, height: H, overflow: 'hidden'}}>
      <Fundo />

      {/* Apresentador */}
      <div
        style={{
          position: 'absolute',
          left: caixa.x,
          top: caixa.y,
          width: caixa.w,
          height: caixa.h,
          borderRadius: caixa.r,
          overflow: 'hidden',
          WebkitMaskImage: mascara,
          maskImage: mascara,
          boxShadow: caixa.r > 1 ? '0 20px 60px rgba(0,0,0,0.45)' : undefined,
          border: cena.layout === 'grafico' ? `4px solid ${COR.destaque}` : undefined,
        }}
      >
        <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `50% ${focoY}%`}}>
          {props.video ? (
            <OffthreadVideo
              src={staticFile(props.video)}
              style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${focoY}%`}}
            />
          ) : (
            <Placeholder />
          )}
        </div>
      </div>

      {/* Linha de costura do split */}
      {cena.layout === 'split' && (
        <div
          style={{
            position: 'absolute',
            left: 60,
            right: 60,
            top: 934,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${COR.destaque}, transparent)`,
            opacity: pTrans * 0.8,
          }}
        />
      )}

      {/* Crédito da fonte */}
      {props.fonte && cena.layout !== 'full' && cena.layout !== 'grafico' && (
        <div
          style={{
            position: 'absolute',
            top: 232,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONTE,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: COR.suave,
            opacity: pTrans,
          }}
        >
          {props.fonte}
        </div>
      )}

      {/* Esquema / gráfico da cena */}
      {temGrafico && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: area.top,
            height: area.height,
            opacity: mesmaProx ? 1 : saida,
          }}
        >
          {/* Todo esquema é desenhado num palco de 1080x700 e escalado para caber na área. */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: W,
              height: ALTURA_PALCO,
              transformOrigin: '50% 0%',
              transform: `scale(${Math.min(1, area.height / ALTURA_PALCO)})`,
              marginLeft: 0,
            }}
          >
            <RenderGrafico g={cena.grafico!} t={tCena - atrasoEntrada} dur={dur} />
          </div>
        </div>
      )}

      <Legendas
        palavras={props.palavras}
        destaques={props.destaques ?? []}
        y={Y_LEGENDA[cena.layout]}
        estilo={cena.layout === 'split' ? 'pilula' : 'livre'}
      />

      {props.musica && <Audio src={staticFile(props.musica)} volume={props.volumeMusica ?? 0.08} loop />}
    </AbsoluteFill>
  );
};
