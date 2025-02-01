import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { ExportOptions } from '@/types/video';
import { cleanupFiles } from './cleanupFiles';

export const concatenateVideos = async (
  ffmpeg: FFmpeg,
  hook: File,
  sellingPoint: File,
  cta: File,
  onProgress: (progress: number) => void,
  options: ExportOptions = {
    quality: 'low',
    speed: 'fast',
    preset: 'ultrafast',
    threads: navigator.hardwareConcurrency || 4
  }
) => {
  try {
    if (!ffmpeg || !ffmpeg.loaded) {
      throw new Error('FFmpeg is not properly initialized');
    }

    console.log('Starting concatenation process with optimized settings...');
    
    // Write files in parallel
    await Promise.all([
      ffmpeg.writeFile('hook.mp4', await fetchFile(hook)),
      ffmpeg.writeFile('selling.mp4', await fetchFile(sellingPoint)),
      ffmpeg.writeFile('cta.mp4', await fetchFile(cta))
    ]);
    onProgress(30);

    const concat = 'file hook.mp4\nfile selling.mp4\nfile cta.mp4';
    await ffmpeg.writeFile('concat.txt', concat);

    console.log('Executing FFmpeg command with optimized settings...');
    const command = [
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c:v', 'libx264', 
      '-preset', options.preset,
      '-crf', '28',  // Lower quality for faster processing
      '-threads', options.threads.toString(),
      '-movflags', '+faststart',  // Enable fast start for quicker playback
      '-y',  // Overwrite output files without asking
      'output.mp4'
    ];
    
    console.log('FFmpeg command:', command.join(' '));
    await ffmpeg.exec(command);
    
    console.log('Reading output file...');
    const data = await ffmpeg.readFile('output.mp4');
    onProgress(90);
    
    const blob = new Blob([data], { type: 'video/mp4' });
    await cleanupFiles(ffmpeg);
    
    console.log('Video concatenation completed successfully');
    return blob;
  } catch (error) {
    console.error('Video concatenation error:', error);
    throw new Error(`Failed to concatenate videos: ${error.message || 'Unknown error occurred'}`);
  }
};