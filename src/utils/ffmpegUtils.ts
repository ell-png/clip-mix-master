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
      let coreURL;
      try {
        coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
        console.log('Core.js fetched successfully');
      } catch (error) {
        console.error('Failed to fetch core.js:', error);
        throw new Error(`Failed to fetch FFmpeg core.js: ${error.message}`);
      }
      
      console.log('Fetching core.wasm...');
      let wasmURL;
      try {
        wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
        console.log('Core.wasm fetched successfully');
      } catch (error) {
        console.error('Failed to fetch core.wasm:', error);
        throw new Error(`Failed to fetch FFmpeg core.wasm: ${error.message}`);
      }
      
      console.log('Loading FFmpeg with URLs:', { coreURL, wasmURL });
      try {
        await ffmpeg.load({
          coreURL,
          wasmURL,
          progress: (progress) => {
            console.log('FFmpeg loading progress:', progress);
          }
        });
        console.log('FFmpeg load completed successfully');
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        throw new Error(`Failed to load FFmpeg: ${error.message}`);
      }

      // Wait a bit to ensure everything is properly initialized
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify FFmpeg is loaded and ready
      if (!ffmpeg.loaded) {
        console.error('FFmpeg not properly loaded after initialization');
        throw new Error('FFmpeg failed to initialize properly');
      }
      
      console.log('FFmpeg initialization completed successfully');
    } else {
      console.log('Reusing existing FFmpeg instance');
      if (!ffmpeg.loaded) {
        console.error('Existing FFmpeg instance is not properly loaded');
        throw new Error('Existing FFmpeg instance is not properly initialized');
      }
    }
    
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg initialization error:', error);
    ffmpeg = null; // Reset the instance on error
    throw new Error(`Failed to initialize FFmpeg: ${error.message || 'Unknown error occurred'}`);
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