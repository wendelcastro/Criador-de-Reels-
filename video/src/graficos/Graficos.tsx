import React from 'react';
import {interpolate} from 'remotion';
import {Grafico} from '../types';
import {COR, FONTE, FONTE_SERIFA} from '../theme';
import {easeOut} from '../anim';
import {Coluna, contar, entrada, GProps, Rotulo, Selo, sobe, TituloEditorial} from './base';

type G<K extends Grafico['tipo']> = Extract<Grafico, {tipo: K}>;

// Ritmo: um elemento de cada vez, cada um entrando ~0,25 s depois do anterior.

const Titulo: React.FC<GProps<G<'titulo'>>> = ({g, t}) => (
  <Coluna>
    {g.selo && <Selo texto={g.selo} p={entrada(t, 0)} />}
    <TituloEditorial texto={g.titulo} destaque={g.destaque} p={entrada(t, 0.15)} tamanho={84} />
    {g.subtitulo && <Rotulo texto={g.subtitulo} p={entrada(t, 0.45)} />}
  </Coluna>
);

const Numero: React.FC<GProps<G<'numero'>>> = ({g, t}) => {
  const p = entrada(t, 0, 0.4);
  return (
    <Coluna gap={12}>
      <div
        style={{
          ...sobe(p, 30),
          fontFamily: FONTE,
          fontWeight: 900,
          fontSize: 230,
          lineHeight: 1,
          letterSpacing: -8,
          color: COR.destaque,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {g.prefixo}
        {contar(g.valor, t, 0.05, 0.9, g.casas ?? 0)}
        {g.sufixo}
      </div>
      <Rotulo texto={g.rotulo} p={entrada(t, 0.3)} tamanho={52} cor={COR.texto} />
      {g.detalhe && <Rotulo texto={g.detalhe} p={entrada(t, 0.6)} tamanho={34} />}
    </Coluna>
  );
};

const Comparativo: React.FC<GProps<G<'comparativo'>>> = ({g, t}) => (
  <Coluna gap={36}>
    {g.titulo && <Rotulo texto={g.titulo} p={entrada(t, 0)} tamanho={40} cor={COR.texto} />}
    <div style={{display: 'flex', gap: 28, width: '100%', justifyContent: 'center'}}>
      {g.itens.map((it, i) => {
        const p = entrada(t, it.t ?? 0.2 + i * 0.6);
        return (
          <div
            key={i}
            style={{
              ...sobe(p),
              flex: 1,
              maxWidth: 420,
              background: COR.painel,
              border: `2px solid ${i === g.itens.length - 1 ? COR.destaque : COR.borda}`,
              borderRadius: 36,
              padding: '40px 28px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: FONTE,
                fontWeight: 900,
                fontSize: it.valor.length <= 4 ? 104 : it.valor.length <= 6 ? 74 : 60,
                letterSpacing: -2,
                lineHeight: 1,
                color: i === g.itens.length - 1 ? COR.destaque : COR.texto,
              }}
            >
              {it.valor}
            </div>
            <div style={{fontFamily: FONTE, fontWeight: 600, fontSize: 32, color: COR.suave, marginTop: 16, lineHeight: 1.25}}>
              {it.rotulo}
            </div>
          </div>
        );
      })}
    </div>
  </Coluna>
);

const Donut: React.FC<GProps<G<'donut'>>> = ({g, t}) => {
  const p = interpolate(t, [0.1, 1.1], [0, 1], {easing: easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const raio = 150;
  const circ = 2 * Math.PI * raio;
  const preenchido = (g.percentual / 100) * circ * p;
  return (
    <Coluna gap={26}>
      {g.titulo && <Rotulo texto={g.titulo} p={entrada(t, 0)} tamanho={40} cor={COR.texto} />}
      <div style={{position: 'relative', width: 380, height: 380, ...sobe(entrada(t, 0), 20)}}>
        <svg width={380} height={380} viewBox="0 0 420 420">
          <circle cx={210} cy={210} r={raio} fill="none" stroke={COR.borda} strokeWidth={44} />
          <circle
            cx={210}
            cy={210}
            r={raio}
            fill="none"
            stroke={COR.destaque}
            strokeWidth={44}
            strokeLinecap="round"
            strokeDasharray={`${preenchido} ${circ}`}
            transform="rotate(-90 210 210)"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTE,
            fontWeight: 900,
            fontSize: 120,
            letterSpacing: -4,
            color: COR.texto,
          }}
        >
          {contar(g.percentual, t, 0.1, 1.0)}%
        </div>
      </div>
      <Rotulo texto={g.rotulo} p={entrada(t, 0.5)} tamanho={42} cor={COR.texto} />
      {g.resto && <Rotulo texto={g.resto} p={entrada(t, 0.9)} tamanho={32} />}
    </Coluna>
  );
};

const Lista: React.FC<GProps<G<'lista'>>> = ({g, t}) => (
  <Coluna gap={22}>
    <TituloEditorial texto={g.titulo} p={entrada(t, 0)} tamanho={56} />
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: '100%', marginTop: 10}}>
      {g.itens.map((it, i) => {
        const p = entrada(t, it.t ?? 0.35 + i * 0.55);
        const cor = g.icone === 'alerta' ? COR.alerta : COR.destaque;
        return (
          <div
            key={i}
            style={{
              opacity: p,
              transform: `translateX(${(1 - p) * -50}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              background: COR.painel,
              border: `2px solid ${COR.borda}`,
              borderRadius: 26,
              padding: '20px 26px',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: 16,
                background: cor,
                color: COR.fundo,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTE,
                fontWeight: 900,
                fontSize: 30,
              }}
            >
              {g.icone === 'numero' ? i + 1 : g.icone === 'alerta' ? '!' : '✓'}
            </div>
            <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 38, color: COR.texto, lineHeight: 1.2}}>{it.texto}</div>
          </div>
        );
      })}
    </div>
  </Coluna>
);

const Citacao: React.FC<GProps<G<'citacao'>>> = ({g, t}) => (
  <Coluna gap={26}>
    <div style={{...sobe(entrada(t, 0), 20), fontFamily: FONTE_SERIFA, fontSize: 200, lineHeight: 0.6, color: COR.destaque, height: 90}}>
      “
    </div>
    <div
      style={{
        ...sobe(entrada(t, 0.15)),
        fontFamily: FONTE_SERIFA,
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: 60,
        lineHeight: 1.18,
        color: COR.texto,
        textAlign: 'center',
      }}
    >
      {g.texto}
    </div>
    <Rotulo texto={g.autor} p={entrada(t, 0.55)} tamanho={30} />
  </Coluna>
);

const Pessoa: React.FC<{cor: string; p: number}> = ({cor, p}) => (
  <svg width={86} height={120} viewBox="0 0 86 120" style={{opacity: p, transform: `scale(${0.6 + 0.4 * p})`}}>
    <circle cx={43} cy={28} r={24} fill={cor} />
    <path d="M5 118 C5 78 22 62 43 62 C64 62 81 78 81 118 Z" fill={cor} />
  </svg>
);

const Multiplicador: React.FC<GProps<G<'multiplicador'>>> = ({g, t}) => (
  <Coluna gap={30}>
    <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
      <div style={{display: 'flex', gap: 8}}>
        {Array.from({length: g.de}).map((_, i) => (
          <Pessoa key={i} cor={COR.destaque} p={entrada(t, 0.05)} />
        ))}
      </div>
      <div style={{...sobe(entrada(t, 0.4), 10), fontFamily: FONTE, fontWeight: 900, fontSize: 70, color: COR.suave}}>=</div>
      <div style={{display: 'flex', gap: 8}}>
        {Array.from({length: g.para}).map((_, i) => (
          <Pessoa key={i} cor={COR.texto} p={entrada(t, 0.6 + i * 0.18, 0.3)} />
        ))}
      </div>
    </div>
    <div
      style={{
        ...sobe(entrada(t, 0.6 + g.para * 0.18)),
        fontFamily: FONTE,
        fontWeight: 900,
        fontSize: 170,
        letterSpacing: -6,
        lineHeight: 1,
        color: COR.destaque,
      }}
    >
      {g.para / g.de}x
    </div>
    <Rotulo texto={g.rotulo} p={entrada(t, 0.8 + g.para * 0.18)} tamanho={44} cor={COR.texto} />
    {g.detalhe && <Rotulo texto={g.detalhe} p={entrada(t, 1.1 + g.para * 0.18)} tamanho={30} />}
  </Coluna>
);

const Chips: React.FC<GProps<G<'chips'>>> = ({g, t}) => (
  <Coluna gap={30}>
    <TituloEditorial texto={g.titulo} p={entrada(t, 0)} tamanho={54} />
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center'}}>
      {g.itens.map((it, i) => {
        const p = entrada(t, 0.3 + i * 0.12, 0.35);
        return (
          <div
            key={i}
            style={{
              opacity: p,
              transform: `scale(${0.8 + 0.2 * p})`,
              fontFamily: FONTE,
              fontWeight: 700,
              fontSize: 34,
              color: COR.texto,
              padding: '14px 26px',
              borderRadius: 999,
              background: i % 3 === 0 ? 'rgba(255,194,74,0.16)' : COR.painel,
              border: `2px solid ${i % 3 === 0 ? COR.destaque : COR.borda}`,
            }}
          >
            {it}
          </div>
        );
      })}
    </div>
  </Coluna>
);

const Lema: React.FC<GProps<G<'lema'>>> = ({g, t}) => {
  const alvo = new Set((g.destaques ?? []).map((d) => d.toLowerCase()));
  return (
    <Coluna gap={14}>
      {g.linhas.map((linha, i) => (
        <div
          key={i}
          style={{
            ...sobe(entrada(t, i * 0.5)),
            fontFamily: FONTE,
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1.15,
            letterSpacing: -1,
            color: COR.texto,
            textAlign: 'center',
          }}
        >
          {linha.split(' ').map((palavra, j) => {
            const limpa = palavra.toLowerCase().replace(/[.,:;!?]/g, '');
            const d = alvo.has(limpa);
            return (
              <span
                key={j}
                style={
                  d
                    ? {fontFamily: FONTE_SERIFA, fontStyle: 'italic', fontWeight: 700, color: COR.destaque}
                    : undefined
                }
              >
                {palavra}{' '}
              </span>
            );
          })}
        </div>
      ))}
      {g.assinatura && <Rotulo texto={g.assinatura} p={entrada(t, g.linhas.length * 0.5 + 0.2)} tamanho={30} />}
    </Coluna>
  );
};

const Cta: React.FC<GProps<G<'cta'>>> = ({g, t}) => (
  <Coluna gap={28}>
    <Rotulo texto={g.acao} p={entrada(t, 0)} tamanho={46} cor={COR.texto} />
    <div
      style={{
        ...sobe(entrada(t, 0.25)),
        fontFamily: FONTE,
        fontWeight: 900,
        fontSize: 110,
        letterSpacing: 2,
        color: COR.fundo,
        background: COR.destaque,
        padding: '18px 56px',
        borderRadius: 32,
        boxShadow: '0 20px 60px rgba(255,194,74,0.35)',
      }}
    >
      {g.palavra}
    </div>
    {g.detalhe && <Rotulo texto={g.detalhe} p={entrada(t, 0.55)} tamanho={32} />}
  </Coluna>
);

export const RenderGrafico: React.FC<{g: Grafico; t: number; dur: number}> = ({g, t, dur}) => {
  switch (g.tipo) {
    case 'titulo':
      return <Titulo g={g} t={t} dur={dur} />;
    case 'numero':
      return <Numero g={g} t={t} dur={dur} />;
    case 'comparativo':
      return <Comparativo g={g} t={t} dur={dur} />;
    case 'donut':
      return <Donut g={g} t={t} dur={dur} />;
    case 'lista':
      return <Lista g={g} t={t} dur={dur} />;
    case 'citacao':
      return <Citacao g={g} t={t} dur={dur} />;
    case 'multiplicador':
      return <Multiplicador g={g} t={t} dur={dur} />;
    case 'chips':
      return <Chips g={g} t={t} dur={dur} />;
    case 'lema':
      return <Lema g={g} t={t} dur={dur} />;
    case 'cta':
      return <Cta g={g} t={t} dur={dur} />;
    default:
      return null;
  }
};
