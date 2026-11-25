import {Config} from '@remotion/cli/config';

// Qualidade de entrega: H.264, CRF 18, 30 fps, áudio AAC 48 kHz.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
