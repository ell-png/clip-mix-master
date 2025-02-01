import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { ExportOptions } from '@/types/video';

let ffmpeg: FFmpeg | null = null;

export const initFFmpeg = async () => {
  try {
    if (!ffmpeg) {
      console.log('Creating new FFmpeg instance...');
      ffmpeg = new FFmpeg();
      
      console.log('Loading FFmpeg with core files...');
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
      
      console.log('Fetching core.js...');
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      
      console.log('Fetching core.wasm...');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      
      console.log('Loading FFmpeg with URLs:', { coreURL, wasmURL });
      await ffmpeg.load({
        coreURL,
        wasmURL,
      });
      console.log('FFmpeg load completed successfully');
    } else {
      console.log('Reusing existing FFmpeg instance');
    }
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg initialization error:', error);
    throw new Error(`Failed to initialize FFmpeg: ${error.message}`);
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
    console.log('Starting concatenation process...');
    console.log('Writing files to FFmpeg filesystem...');
    
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

    // Apply quality and speed settings
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

    console.log('Executing FFmpeg command...');
    const command = [
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-progress', 'pipe:1',
      ...qualitySettings[options.quality].split(' '),
      ...speedSettings[options.speed].split(' '),
      'output.mp4'
    ];
    
    console.log('FFmpeg command:', command.join(' '));
    await ffmpeg.exec(command);
    
    console.log('Reading output file...');
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data], { type: 'video/mp4' });
    
    await cleanupFiles(ffmpeg);
    console.log('Video concatenation completed successfully');
    
    return blob;
  } catch (error) {
    console.error('Video concatenation error:', error);
    throw new Error(`Failed to concatenate videos: ${error.message}`);
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