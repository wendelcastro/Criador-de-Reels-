import React from 'react';
import {CalculateMetadataFunction, Composition} from 'remotion';
import {Reel} from './Reel';
import {ReelProps} from './types';
import demo from './data/demo.json';

const FPS = 30;

const calcular: CalculateMetadataFunction<ReelProps> = ({props}) => ({
  durationInFrames: Math.max(1, Math.ceil(props.duracao * FPS)),
});

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={300}
    defaultProps={demo as ReelProps}
    calculateMetadata={calcular}
  />
);
