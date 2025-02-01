import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

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
          wasmURL
        });
        console.log('FFmpeg load completed successfully');
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        throw new Error(`Failed to load FFmpeg: ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    ffmpeg = null;
    throw new Error(`Failed to initialize FFmpeg: ${error.message || 'Unknown error occurred'}`);
  }
};