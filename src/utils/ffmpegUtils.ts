import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { ExportOptions } from '@/types/video';

let ffmpeg: FFmpeg | null = null;

export const initFFmpeg = async () => {
  try {
    if (!ffmpeg) {
      console.log('Initializing FFmpeg...');
      ffmpeg = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      console.log('FFmpeg initialized successfully');
    }
    return ffmpeg;
  } catch (error) {
    console.error('Error initializing FFmpeg:', error);
    throw new Error('Failed to initialize FFmpeg');
  }
};

export const concatenateVideos = async (
  ffmpeg: FFmpeg,
  hook: File,
  sellingPoint: File,
  cta: File,
  onProgress: (progress: number) => void,
  options: ExportOptions
) => {
  try {
    console.log('Starting video concatenation...');
    onProgress(5);
    
    // Write files to FFmpeg virtual filesystem
    console.log('Writing hook video...');
    await ffmpeg.writeFile('hook.mp4', await fetchFile(hook));
    onProgress(20);
    
    console.log('Writing selling point video...');
    await ffmpeg.writeFile('selling.mp4', await fetchFile(sellingPoint));
    onProgress(40);
    
    console.log('Writing CTA video...');
    await ffmpeg.writeFile('cta.mp4', await fetchFile(cta));
    onProgress(60);

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

    console.log('Starting FFmpeg concatenation...');
    const command = [
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      ...qualitySettings[options.quality].split(' '),
      ...speedSettings[options.speed].split(' '),
      'output.mp4'
    ];
    console.log('FFmpeg command:', command.join(' '));
    
    await ffmpeg.exec(command);
    onProgress(80);
    
    console.log('Reading output file...');
    const data = await ffmpeg.readFile('output.mp4');
    
    const blob = new Blob([data], { type: 'video/mp4' });
    console.log('Video concatenation complete!');
    
    await cleanupFiles(ffmpeg);
    onProgress(100);
    
    return blob;
  } catch (error) {
    console.error('Error in concatenateVideos:', error);
    throw error;
  }
};

const cleanupFiles = async (ffmpeg: FFmpeg) => {
  try {
    console.log('Cleaning up temporary files...');
    await ffmpeg.deleteFile('hook.mp4');
    await ffmpeg.deleteFile('selling.mp4');
    await ffmpeg.deleteFile('cta.mp4');
    await ffmpeg.deleteFile('concat.txt');
    await ffmpeg.deleteFile('output.mp4');
    console.log('Cleanup complete');
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
};