import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
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
  const ffmpegInstanceRef = useRef<any>(null);
  const isExportingRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  const calculateTimeRemaining = useCallback((progress: number) => {
    if (!startTimeRef.current || progress <= 0) return null;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const totalEstimate = (elapsed * 100) / progress;
    return Math.max(0, totalEstimate - elapsed);
  }, []);

  const updateProgress = useCallback((progress: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    
    const timeRemaining = calculateTimeRemaining(progress);
    console.log('Progress update:', { progress, timeRemaining });
    
    setExportProgress({
      percent: progress,
      timeRemaining,
      startTime: startTimeRef.current,
    });
  }, [calculateTimeRemaining]);

  const stopExport = useCallback(() => {
    console.log('Stopping export process');
    isExportingRef.current = false;
    setIsExporting(false);
    setExportProgress({ percent: 0, timeRemaining: null, startTime: null });
    setCurrentExportIndex(0);
    setIsPaused(false);
    startTimeRef.current = null;
    toast({
      title: "Export stopped",
      description: "Video export process has been stopped",
    });
  }, [toast]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
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
    if (isPaused || !isExportingRef.current) return;

    try {
      console.log('Starting export for combination:', index + 1);
      
      setCurrentCombination({
        hook: combination.hook,
        sellingPoint: combination.sellingPoint,
        cta: combination.cta,
      });

      if (!ffmpegInstanceRef.current) {
        console.log('Initializing FFmpeg...');
        const instance = await initFFmpeg();
        ffmpegInstanceRef.current = instance;
      }

      const exportOptions: ExportOptions = {
        quality: 'medium',
        speed: 'fast',
        preset: 'ultrafast',
        threads: navigator.hardwareConcurrency || 4
      };

      console.log('Starting video concatenation...');
      const blob = await concatenateVideos(
        ffmpegInstanceRef.current,
        combination.hook,
        combination.sellingPoint,
        combination.cta,
        updateProgress,
        exportOptions
      );

      // Create and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `combined_video_${index + 1}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Export completed for combination:', index + 1);

      const updatedCombinations = combinations.map((c, i) => 
        i === index ? { ...c, exported: true } : c
      );
      
      onCombinationExported(updatedCombinations);
      
      if (index < combinations.length - 1) {
        setCurrentExportIndex(index + 1);
        setExportProgress(prev => ({ ...prev, percent: 0 }));
        startTimeRef.current = null;
      } else {
        console.log('All exports completed');
        isExportingRef.current = false;
        setIsExporting(false);
        startTimeRef.current = null;
        toast({
          title: "Export complete",
          description: `Successfully exported ${combinations.length} video combinations`,
        });
      }

    } catch (error) {
      console.error('Export error:', error);
      isExportingRef.current = false;
      setIsExporting(false);
      startTimeRef.current = null;
      toast({
        title: "Export failed",
        description: error.message || "There was an error exporting the videos",
        variant: "destructive",
      });
    }
  }, [combinations, isPaused, toast, updateProgress]);

  const startExport = useCallback(async () => {
    if (isExportingRef.current) {
      console.log('Export already in progress');
      return;
    }

    if (!combinations || combinations.length === 0) {
      toast({
        title: "No combinations available",
        description: "Please upload at least one video to each section",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting export process...');
      isExportingRef.current = true;
      setIsExporting(true);
      setCurrentExportIndex(0);
      startTimeRef.current = Date.now();
      setExportProgress({ percent: 0, timeRemaining: null, startTime: startTimeRef.current });
    } catch (error) {
      console.error('Export initialization error:', error);
      isExportingRef.current = false;
      setIsExporting(false);
      startTimeRef.current = null;
      toast({
        title: "Export failed",
        description: error.message || "Failed to initialize video processing",
        variant: "destructive",
      });
    }
  }, [combinations, toast]);

  useEffect(() => {
    if (isExporting && !isPaused && combinations.length > 0) {
      const selectedCombination = combinations[currentExportIndex];
      if (selectedCombination) {
        exportCombination(selectedCombination, currentExportIndex, (updatedCombinations) => {
          console.log('Combination exported successfully');
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