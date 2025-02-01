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
  options: ExportOptions
) => {
  try {
    if (!ffmpeg || !ffmpeg.loaded) {
      throw new Error('FFmpeg is not properly initialized');
    }

    console.log('Starting concatenation process...');
    console.log('Writing files to FFmpeg filesystem...');
    
    try {
      console.log('Writing hook video...');
      await ffmpeg.writeFile('hook.mp4', await fetchFile(hook));
      onProgress(20);
      
      console.log('Writing selling point video...');
      await ffmpeg.writeFile('selling.mp4', await fetchFile(sellingPoint));
      onProgress(40);
      
      console.log('Writing CTA video...');
      await ffmpeg.writeFile('cta.mp4', await fetchFile(cta));
      onProgress(60);
    } catch (error) {
      console.error('Error writing files to FFmpeg:', error);
      throw new Error(`Failed to write video files: ${error.message}`);
    }

    const concat = 'file hook.mp4\nfile selling.mp4\nfile cta.mp4';
    await ffmpeg.writeFile('concat.txt', concat);

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
    try {
      await ffmpeg.exec(command);
    } catch (error) {
      console.error('FFmpeg command execution failed:', error);
      throw new Error(`FFmpeg command failed: ${error.message}`);
    }
    
    console.log('Reading output file...');
    let data;
    try {
      data = await ffmpeg.readFile('output.mp4');
    } catch (error) {
      console.error('Failed to read output file:', error);
      throw new Error(`Failed to read output file: ${error.message}`);
    }
    
    const blob = new Blob([data], { type: 'video/mp4' });
    
    await cleanupFiles(ffmpeg);
    console.log('Video concatenation completed successfully');
    
    return blob;
  } catch (error) {
    console.error('Video concatenation error:', error);
    throw new Error(`Failed to concatenate videos: ${error.message || 'Unknown error occurred'}`);
  }
};