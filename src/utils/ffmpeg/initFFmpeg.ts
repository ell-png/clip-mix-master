import { FFmpeg } from '@ffmpeg/ffmpeg';

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
      
      await ffmpeg.load({
        coreURL: '/ffmpeg-core.js',
        wasmURL: '/ffmpeg-core.wasm'
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