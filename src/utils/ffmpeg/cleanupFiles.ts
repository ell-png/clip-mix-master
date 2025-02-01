import { FFmpeg } from '@ffmpeg/ffmpeg';

export const cleanupFiles = async (ffmpeg: FFmpeg) => {
  try {
    await ffmpeg.deleteFile('hook.mp4');
    await ffmpeg.deleteFile('selling.mp4');
    await ffmpeg.deleteFile('cta.mp4');
    await ffmpeg.deleteFile('concat.txt');
    await ffmpeg.deleteFile('output.mp4');
  } catch (error) {
    console.error('Error cleaning up files:', error);
    // Don't throw here as this is cleanup code
  }
};