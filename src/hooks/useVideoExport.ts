import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

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

  const exportCombination = useCallback(async (combination: Combination, index: number, onCombinationExported: (combinations: Combination[]) => void) => {
    if (isPaused) return;

    setCurrentCombination({
      hook: combination.hook,
      sellingPoint: combination.sellingPoint,
      cta: combination.cta,
    });

    try {
      const downloadFile = async (file: File, prefix: string) => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix}_${file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      await downloadFile(combination.hook, 'hook');
      setExportProgress(33);
      
      await downloadFile(combination.sellingPoint, 'selling_point');
      setExportProgress(66);
      
      await downloadFile(combination.cta, 'cta');
      setExportProgress(100);

      onCombinationExported(prev => 
        prev.map((c, i) => i === index ? { ...c, exported: true } : c)
      );
      
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