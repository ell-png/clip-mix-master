import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VideoSection from '@/components/VideoSection';
import ExportControls from '@/components/ExportControls';
import CombinationsList from '@/components/CombinationsList';
import ExportProgress from '@/components/ExportProgress';
import { useVideoExport } from '@/hooks/useVideoExport';
import { useVideoSections } from '@/hooks/useVideoSections';

interface Combination {
  hook: File;
  sellingPoint: File;
  cta: File;
  exported: boolean;
}

const Index = () => {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ section: string; index: number } | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const { sections, handleUpload, handleRename, handleRenameAll } = useVideoSections();
  const {
    isExporting,
    isPaused,
    exportProgress,
    currentExportIndex,
    stopExport,
    togglePause,
    startExport,
    exportCombination
  } = useVideoExport(combinations);

  useEffect(() => {
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
    if (isExporting && combinations[currentExportIndex]) {
      exportCombination(combinations[currentExportIndex], currentExportIndex, setCombinations);
    }
  }, [isExporting, currentExportIndex, combinations, exportCombination]);

  const handleRenameClick = (section: string, index: number) => {
    setRenameTarget({ section, index });
    setNewFileName('');
    setIsRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (!renameTarget || !newFileName) return;
    handleRename(renameTarget.section as keyof typeof sections, renameTarget.index, newFileName);
    setIsRenameDialogOpen(false);
    setRenameTarget(null);
    setNewFileName('');
  };

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
              onRename={handleRenameClick}
            />
          ))}
        </div>

        <ExportProgress
          isExporting={isExporting}
          exportProgress={exportProgress}
          currentExportIndex={currentExportIndex}
          totalCombinations={combinations.length}
        />

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