import {Config} from '@remotion/cli/config';

// Qualidade de entrega: H.264, CRF 18, 30 fps, áudio AAC 48 kHz.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

// Na nuvem do Claude Code já existe um Chrome headless; usa ele em vez de baixar outro.
import fs from 'node:fs';
const CHROME_NUVEM = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(CHROME_NUVEM)) Config.setBrowserExecutable(CHROME_NUVEM);
