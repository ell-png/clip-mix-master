import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const initFFmpeg = async () => {
  try {
    // Create new instance only if one doesn't exist or isn't loaded
    if (!ffmpeg) {
      console.log('Creating new FFmpeg instance...');
      ffmpeg = new FFmpeg();
    }

    // If FFmpeg exists but isn't loaded, load it
    if (!ffmpeg.loaded) {
      console.log('Loading FFmpeg with core files...');
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
      
      console.log('Fetching core.js...');
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      console.log('Core.js fetched successfully');
      
      console.log('Fetching core.wasm...');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      console.log('Core.wasm fetched successfully');
      
      console.log('Loading FFmpeg with URLs:', { coreURL, wasmURL });
      await ffmpeg.load({
        coreURL,
        wasmURL
      });

      // Add a small delay to ensure loading is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!ffmpeg.loaded) {
        console.error('FFmpeg not properly loaded after initialization');
        throw new Error('FFmpeg failed to initialize properly');
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