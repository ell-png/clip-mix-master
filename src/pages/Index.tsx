import React, { useState, useCallback, useEffect } from 'react';
import VideoUploader from '@/components/VideoUploader';
import { Button } from '@/components/ui/button';
import { Play, Download, StopCircle, PauseCircle, Edit2, Edit3 } from 'lucide-react';
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

  const exportCombination = useCallback((combination: Combination, index: number) => {
    if (isPaused) return;

    setCurrentCombination({
      hook: combination.hook,
      sellingPoint: combination.sellingPoint,
      cta: combination.cta,
    });

    // Simulate export progress for this combination
    let progress = 0;
    const interval = setInterval(() => {
      if (isPaused) {
        clearInterval(interval);
        return;
      }

      progress += 10;
      if (progress <= 100) {
        setExportProgress(progress);
      } else {
        clearInterval(interval);
        setCombinations(prev => 
          prev.map((c, i) => i === index ? { ...c, exported: true } : c)
        );
        
        // Move to next combination
        if (index < combinations.length - 1) {
          setCurrentExportIndex(index + 1);
        } else {
          setIsExporting(false);
          toast({
            title: "Export complete",
            description: `Successfully exported ${combinations.length} video combinations`,
          });
        }
      }
    }, 500);
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
            <div key={section}>
              <h2 className="text-xl mb-4">{section} ({files.length} clips)</h2>
              <VideoUploader 
                section={section as 'hook' | 'selling-point' | 'cta'} 
                onUpload={(file) => handleUpload(section as keyof typeof sections, file)} 
              />
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-editor-muted">
                      <span className="truncate flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRename(section, index)}
                        className="ml-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          <div className="flex-1 bg-editor-surface p-4 rounded-lg">
            <h3 className="text-lg mb-4">All Combinations ({combinations.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {combinations.map((combo, index) => (
                <div 
                  key={index} 
                  className={`text-sm p-2 rounded ${
                    combo.exported ? 'bg-editor-accent text-editor-muted' : 'bg-editor-bg'
                  }`}
                >
                  {combo.hook.name} → {combo.sellingPoint.name} → {combo.cta.name}
                  {combo.exported && ' (Exported)'}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={startExport}
              disabled={isExporting || combinations.length === 0}
              className="bg-editor-highlight hover:bg-editor-highlight/90 text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              Export All Combinations
            </Button>

            {isExporting && (
              <>
                <Button onClick={togglePause} variant="outline">
                  <PauseCircle className="mr-2 h-4 w-4" />
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={stopExport} variant="destructive">
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Export
                </Button>
              </>
            )}

            <Button 
              onClick={handleRenameAll} 
              variant="outline"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Rename All
            </Button>
          </div>
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
