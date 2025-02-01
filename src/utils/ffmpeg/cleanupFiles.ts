import { FFmpeg } from '@ffmpeg/ffmpeg';

export const cleanupFiles = async (ffmpeg: FFmpeg) => {
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