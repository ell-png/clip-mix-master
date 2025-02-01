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
import { Plus, Minus } from 'lucide-react';
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
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);

  const {
    sections,
    handleUpload,
    handleRename,
    handleDelete,
    addSection,
    deleteSection
  } = useVideoSections();

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
    if (sections.hook && sections.sellingPoint && sections.cta) {
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
    }
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
    handleRename(renameTarget.section, renameTarget.index, newFileName);
    setIsRenameDialogOpen(false);
    setRenameTarget(null);
    setNewFileName('');
  };

  const handleAddSection = () => {
    if (!newSectionName) return;
    addSection(newSectionName);
    setIsAddSectionDialogOpen(false);
    setNewSectionName('');
  };

  return (
    <div className="min-h-screen bg-editor-bg text-editor-text p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Video Editor</h1>
          <Button onClick={() => setIsAddSectionDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 group">
          {Object.entries(sections).map(([section, files]) => (
            <div key={section} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 text-red-500 hover:text-red-600"
                onClick={() => deleteSection(section)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <VideoSection
                section={section}
                files={files}
                onUpload={handleUpload}
                onRename={handleRenameClick}
                onDelete={handleDelete}
              />
            </div>
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
            onRenameAll={() => {}}
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

      <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Enter section name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSection}>
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;