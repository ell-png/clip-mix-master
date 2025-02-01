import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import VideoSection from '@/components/VideoSection';
import ExportControls from '@/components/ExportControls';
import CombinationsList from '@/components/CombinationsList';

interface VideoSelection {
  hook: File | null;
  sellingPoint: File | null;
  cta: File | null;
}

interface Combination {
  hook: File;
  sellingPoint: File;
  cta: File;
  exported: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState({
    hook: [] as File[],
    sellingPoint: [] as File[],
    cta: [] as File[],
  });
  
  const [currentCombination, setCurrentCombination] = useState<VideoSelection>({
    hook: null,
    sellingPoint: null,
    cta: null,
  });
  
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExportIndex, setCurrentExportIndex] = useState(0);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ section: string; index: number } | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const generateCombinations = useCallback(() => {
    const newCombinations: Combination[] = [];
    sections.hook.forEach(hook => {
      sections.sellingPoint.forEach(sellingPoint => {
        sections.cta.forEach(cta => {
          newCombinations.push({
            hook,
            sellingPoint,
            cta,
            exported: false
          });
        });
      });
    });
    setCombinations(newCombinations);
  }, [sections]);

  useEffect(() => {
    generateCombinations();
  }, [sections, generateCombinations]);

  const handleUpload = useCallback((section: keyof typeof sections, file: File) => {
    setSections(prev => ({
      ...prev,
      [section]: [...prev[section], file]
    }));
    toast({
      title: "Video uploaded",
      description: `Added to ${section} section`,
    });
  }, [toast]);

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

  const exportCombination = useCallback(async (combination: Combination, index: number) => {
    if (isPaused) return;

    setCurrentCombination({
      hook: combination.hook,
      sellingPoint: combination.sellingPoint,
      cta: combination.cta,
    });

    try {
      // Create a download link for each video file
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

      // Download each video in the combination
      await downloadFile(combination.hook, 'hook');
      setExportProgress(33);
      
      await downloadFile(combination.sellingPoint, 'selling_point');
      setExportProgress(66);
      
      await downloadFile(combination.cta, 'cta');
      setExportProgress(100);

      // Mark combination as exported
      setCombinations(prev => 
        prev.map((c, i) => i === index ? { ...c, exported: true } : c)
      );
      
      // Move to next combination after a short delay
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

  const handleRename = useCallback((section: string, index: number) => {
    setRenameTarget({ section, index });
    setNewFileName('');
    setIsRenameDialogOpen(true);
  }, []);

  const handleRenameAll = useCallback(() => {
    setSections(prev => {
      const newSections = { ...prev };
      Object.keys(newSections).forEach(section => {
        newSections[section as keyof typeof sections] = newSections[section as keyof typeof sections].map((file: File, index: number) => {
          const newFile = new File([file], `${section}_${index + 1}${file.name.substring(file.name.lastIndexOf('.'))}`, {
            type: file.type,
          });
          return newFile;
        });
      });
      return newSections;
    });
    toast({
      title: "Files renamed",
      description: "All files have been renamed with sequential numbers",
    });
  }, [toast]);

  const confirmRename = useCallback(() => {
    if (!renameTarget || !newFileName) return;

    setSections(prev => {
      const newSections = { ...prev };
      const file = newSections[renameTarget.section as keyof typeof sections][renameTarget.index];
      const newFile = new File([file], `${newFileName}${file.name.substring(file.name.lastIndexOf('.'))}`, {
        type: file.type,
      });
      newSections[renameTarget.section as keyof typeof sections][renameTarget.index] = newFile;
      return newSections;
    });

    setIsRenameDialogOpen(false);
    setRenameTarget(null);
    setNewFileName('');
    toast({
      title: "File renamed",
      description: "The file has been successfully renamed",
    });
  }, [renameTarget, newFileName, toast]);

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
    
    // Reset export status
    setCombinations(prev => prev.map(c => ({ ...c, exported: false })));
  }, [combinations.length, toast]);

  // Start exporting the current combination when currentExportIndex changes
  useEffect(() => {
    if (isExporting && combinations[currentExportIndex]) {
      exportCombination(combinations[currentExportIndex], currentExportIndex);
    }
  }, [isExporting, currentExportIndex, combinations, exportCombination]);

  return (
    <div className="min-h-screen bg-editor-bg text-editor-text p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Video Editor</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 group">
          {Object.entries(sections).map(([section, files]) => (
            <VideoSection
              key={section}
              section={section}
              files={files}
              onUpload={handleUpload}
              onRename={handleRename}
            />
          ))}
        </div>

        {isExporting && (
          <div className="mb-8">
            <Progress value={exportProgress} className="h-2" />
            <p className="text-sm text-editor-muted mt-2">
              Exporting combination {currentExportIndex + 1} of {combinations.length} ({exportProgress}%)
            </p>
          </div>
        )}

        <div className="flex justify-between items-start gap-4">
          <CombinationsList combinations={combinations} />
          <ExportControls
            isExporting={isExporting}
            isPaused={isPaused}
            combinationsLength={combinations.length}
            onStartExport={startExport}
            onTogglePause={togglePause}
            onStopExport={stopExport}
            onRenameAll={handleRenameAll}
          />
        </div>
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new file name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
