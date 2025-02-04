import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const initFFmpeg = async () => {
  try {
    // Create new instance only if one doesn't exist
    if (!ffmpeg) {
      console.log('Creating new FFmpeg instance...');
      ffmpeg = new FFmpeg();
    }

    // If FFmpeg exists but isn't loaded, load it
    if (!ffmpeg.loaded) {
      console.log('Loading FFmpeg...');
      
      // Add error event listener before loading
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg log:', message);
      });

      // Load FFmpeg with blob URLs
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });

      // Add a small delay to ensure loading is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!ffmpeg.loaded) {
        throw new Error('FFmpeg failed to load after initialization');
      }
      
      console.log('FFmpeg initialization completed successfully');
    } else {
      console.log('Reusing existing FFmpeg instance');
    }
    
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg initialization error:', error);
    ffmpeg = null; // Reset the instance on error
    throw new Error(`Failed to initialize FFmpeg: ${error.message}`);
  }
};