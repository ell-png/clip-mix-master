import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

interface Combination {
  hook: File;
  sellingPoint: File;
  cta: File;
  exported: boolean;
}

interface VideoSelection {
  hook: File | null;
  sellingPoint: File | null;
  cta: File | null;
}

export const useVideoExport = (combinations: Combination[]) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentExportIndex, setCurrentExportIndex] = useState(0);
  const [currentCombination, setCurrentCombination] = useState<VideoSelection>({
    hook: null,
    sellingPoint: null,
    cta: null,
  });

  const stopExport = useCallback(() => {
    setIsExporting(false);
    setExportProgress(0);
    setCurrentExportIndex(0);
    setIsPaused(false);
    toast({
      title: "Export stopped",
      description: "Video export process has been stopped",
    });
  }, [toast]);

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Export resumed" : "Export paused",
      description: isPaused ? "Continuing video export" : "Video export has been paused",
    });
  }, [isPaused, toast]);

  const exportCombination = useCallback(async (
    combination: Combination,
    index: number,
    onCombinationExported: (combinations: Combination[]) => void
  ) => {
    if (isPaused) return;

    setCurrentCombination({
      hook: combination.hook,
      sellingPoint: combination.sellingPoint,
      cta: combination.cta,
    });

    try {
      if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      }

      // Write files to FFMPEG virtual filesystem
      await ffmpeg.writeFile('hook.mp4', await fetchFile(combination.hook));
      await ffmpeg.writeFile('selling.mp4', await fetchFile(combination.sellingPoint));
      await ffmpeg.writeFile('cta.mp4', await fetchFile(combination.cta));

      // Create a concat file
      const concat = 'file hook.mp4\nfile selling.mp4\nfile cta.mp4';
      await ffmpeg.writeFile('concat.txt', concat);

      setExportProgress(33);

      // Concatenate videos
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        'output.mp4'
      ]);

      setExportProgress(66);

      // Read the result
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      // Download the combined video
      const a = document.createElement('a');
      a.href = url;
      a.download = `combined_video_${index + 1}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportProgress(100);

      // Clean up files
      await ffmpeg.deleteFile('hook.mp4');
      await ffmpeg.deleteFile('selling.mp4');
      await ffmpeg.deleteFile('cta.mp4');
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile('output.mp4');

      const updatedCombinations = combinations.map((c, i) => 
        i === index ? { ...c, exported: true } : c
      );
      
      onCombinationExported(updatedCombinations);
      
      setTimeout(() => {
        if (index < combinations.length - 1) {
          setCurrentExportIndex(index + 1);
          setExportProgress(0);
        } else {
          setIsExporting(false);
          toast({
            title: "Export complete",
            description: `Successfully exported ${combinations.length} video combinations`,
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the videos",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  }, [combinations.length, isPaused, toast]);

  const startExport = useCallback(() => {
    if (combinations.length === 0) {
      toast({
        title: "No combinations available",
        description: "Please upload at least one video to each section",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setCurrentExportIndex(0);
    setExportProgress(0);
  }, [combinations.length, toast]);

  return {
    isExporting,
    isPaused,
    exportProgress,
    currentExportIndex,
    currentCombination,
    stopExport,
    togglePause,
    startExport,
    exportCombination
  };
};