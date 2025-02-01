import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { ExportOptions } from '@/types/video';

let ffmpeg: FFmpeg | null = null;

export const initFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  }
  return ffmpeg;
};

export const concatenateVideos = async (
  ffmpeg: FFmpeg,
  hook: File,
  sellingPoint: File,
  cta: File,
  onProgress: (progress: number) => void,
  options: ExportOptions
) => {
  await ffmpeg.writeFile('hook.mp4', await fetchFile(hook));
  onProgress(20);
  
  await ffmpeg.writeFile('selling.mp4', await fetchFile(sellingPoint));
  onProgress(30);
  
  await ffmpeg.writeFile('cta.mp4', await fetchFile(cta));
  onProgress(40);

  const concat = 'file hook.mp4\nfile selling.mp4\nfile cta.mp4';
  await ffmpeg.writeFile('concat.txt', concat);

  // Apply quality and speed settings based on options
  const qualitySettings = {
    low: '-crf 28',
    medium: '-crf 23',
    high: '-crf 18'
  };
  
  const speedSettings = {
    slow: '-preset veryslow',
    medium: '-preset medium',
    fast: '-preset veryfast'
  };

  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    ...qualitySettings[options.quality].split(' '),
    ...speedSettings[options.speed].split(' '),
    'output.mp4'
  ]);
  onProgress(70);

  const data = await ffmpeg.readFile('output.mp4');
  const blob = new Blob([data], { type: 'video/mp4' });
  
  await cleanupFiles(ffmpeg);
  
  return blob;
};

const cleanupFiles = async (ffmpeg: FFmpeg) => {
  await ffmpeg.deleteFile('hook.mp4');
  await ffmpeg.deleteFile('selling.mp4');
  await ffmpeg.deleteFile('cta.mp4');
  await ffmpeg.deleteFile('concat.txt');
  await ffmpeg.deleteFile('output.mp4');
};