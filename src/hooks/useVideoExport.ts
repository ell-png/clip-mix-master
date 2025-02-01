import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { initFFmpeg, concatenateVideos } from '@/utils/ffmpegUtils';
import { VideoFile, VideoSelection, ExportProgress, ExportOptions } from '@/types/video';

export const useVideoExport = (combinations: VideoFile[]) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    percent: 0,
    timeRemaining: null,
    startTime: null,
  });
  const [currentExportIndex, setCurrentExportIndex] = useState(0);
  const [currentCombination, setCurrentCombination] = useState<VideoSelection>({
    hook: null,
    sellingPoint: null,
    cta: null,
  });
  const [ffmpegInstance, setFfmpegInstance] = useState<any>(null);

  const calculateTimeRemaining = (progress: number, startTime: number) => {
    const elapsed = (Date.now() - startTime) / 1000;
    const totalEstimate = (elapsed * 100) / progress;
    return Math.max(0, totalEstimate - elapsed);
  };

  const updateProgress = (progress: number) => {
    setExportProgress(prev => ({
      percent: progress,
      timeRemaining: prev.startTime ? calculateTimeRemaining(progress, prev.startTime) : null,
      startTime: prev.startTime,
    }));
  };

  const stopExport = useCallback(() => {
    setIsExporting(false);
    setExportProgress({ percent: 0, timeRemaining: null, startTime: null });
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
    combination: VideoFile,
    index: number,
    onCombinationExported: (combinations: VideoFile[]) => void
  ) => {
    if (isPaused) return;

    try {
      console.log('Starting export for combination:', index + 1);
      
      setCurrentCombination({
        hook: combination.hook,
        sellingPoint: combination.sellingPoint,
        cta: combination.cta,
      });

      // Initialize FFmpeg if needed
      let ffmpeg = ffmpegInstance;
      if (!ffmpeg) {
        console.log('No FFmpeg instance found, initializing...');
        try {
          ffmpeg = await initFFmpeg();
          console.log('FFmpeg initialized successfully');
          setFfmpegInstance(ffmpeg);
        } catch (error) {
          console.error('FFmpeg initialization failed:', error);
          throw error;
        }
      }

      if (!exportProgress.startTime) {
        setExportProgress(prev => ({ ...prev, startTime: Date.now() }));
      }

      const exportOptions: ExportOptions = {
        quality: 'medium',
        speed: 'fast',
        preset: 'ultrafast',
        threads: navigator.hardwareConcurrency || 4
      };

      console.log('Starting video concatenation process...');
      const blob = await concatenateVideos(
        ffmpeg,
        combination.hook,
        combination.sellingPoint,
        combination.cta,
        updateProgress,
        exportOptions
      );

      console.log('Creating download link...');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `combined_video_${index + 1}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      updateProgress(100);

      const updatedCombinations = combinations.map((c, i) => 
        i === index ? { ...c, exported: true } : c
      );
      
      onCombinationExported(updatedCombinations);
      
      console.log('Export completed for combination:', index + 1);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (index < combinations.length - 1) {
        setCurrentExportIndex(index + 1);
        setExportProgress({ percent: 0, timeRemaining: null, startTime: null });
      } else {
        setIsExporting(false);
        toast({
          title: "Export complete",
          description: `Successfully exported ${combinations.length} video combinations`,
        });
      }

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error.message || "There was an error exporting the videos",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  }, [combinations.length, isPaused, toast, exportProgress.startTime, ffmpegInstance]);

  const startExport = useCallback(async () => {
    if (combinations.length === 0) {
      toast({
        title: "No combinations available",
        description: "Please upload at least one video to each section",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting export process...');
      setIsExporting(true);
      setCurrentExportIndex(0);
      setExportProgress({ percent: 0, timeRemaining: null, startTime: Date.now() });
      
      // Initialize FFmpeg if needed
      if (!ffmpegInstance) {
        console.log('Initializing FFmpeg before export...');
        try {
          const instance = await initFFmpeg();
          console.log('FFmpeg initialized successfully');
          setFfmpegInstance(instance);
        } catch (error) {
          console.error('FFmpeg initialization failed:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Export initialization error:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to initialize video processing",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  }, [combinations.length, toast, ffmpegInstance]);

  useEffect(() => {
    if (isExporting && !isPaused && combinations.length > 0) {
      const selectedCombination = combinations[currentExportIndex];
      if (selectedCombination) {
        exportCombination(selectedCombination, currentExportIndex, (updatedCombinations) => {
          // Handle the updated combinations if needed
        });
      }
    }
  }, [isExporting, isPaused, currentExportIndex, combinations, exportCombination]);

  return {
    isExporting,
    isPaused,
    exportProgress: exportProgress.percent,
    timeRemaining: exportProgress.timeRemaining,
    currentExportIndex,
    currentCombination,
    stopExport,
    togglePause,
    startExport,
    exportCombination
  };
};
