import {Easing, interpolate, spring} from 'remotion';

// Regras de movimento: entradas de 0,3 a 0,6 s com ease-out, nunca linear.
export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);

/** Progresso 0..1 de uma entrada que começa em `inicio` (segundos) e dura `dur`. */
export const entrada = (t: number, inicio = 0, dur = 0.45) =>
  interpolate(t, [inicio, inicio + dur], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Mola com amortecimento "premium" (zeta ~0,75). */
export const mola = (frame: number, fps: number, atrasoFrames = 0) =>
  spring({frame: frame - atrasoFrames, fps, config: {damping: 16, stiffness: 140, mass: 0.9}});

/** Estilo padrão de entrada: sobe 40 px e aparece. */
export const sobe = (p: number, dist = 40) => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});
