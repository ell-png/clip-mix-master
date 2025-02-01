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
import { Plus, Minus, GripVertical } from 'lucide-react';
import VideoSection from '@/components/VideoSection';
import ExportControls from '@/components/ExportControls';
import CombinationsList from '@/components/CombinationsList';
import ExportProgress from '@/components/ExportProgress';
import { useVideoExport } from '@/hooks/useVideoExport';
import { useVideoSections } from '@/hooks/useVideoSections';

interface Combination {
  id: number;
  hook: File;
  sellingPoint: File;
  cta: File;
  exported: boolean;
}

const Index = () => {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [selectedCombinations, setSelectedCombinations] = useState<number[]>([]);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ section: string; index: number } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [draggedSection, setDraggedSection] = useState<number | null>(null);

  const {
    sections,
    sectionOrder,
    handleUpload,
    handleRename,
    handleDelete,
    addSection,
    deleteSection,
    reorderSections
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
  } = useVideoExport(combinations.filter(c => selectedCombinations.includes(c.id)));

  useEffect(() => {
    let id = 0;
    const newCombinations: Combination[] = [];
    if (sections.hook && sections.sellingPoint && sections.cta) {
      sections.hook.forEach(hook => {
        sections.sellingPoint.forEach(sellingPoint => {
          sections.cta.forEach(cta => {
            newCombinations.push({
              id: id++,
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
    setSelectedCombinations([]);
  }, [sections]);

  const handleSelectCombination = (id: number) => {
    setSelectedCombinations(prev => 
      prev.includes(id)
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

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

  const handleDragStart = (index: number) => {
    setDraggedSection(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSection === null || draggedSection === index) return;
    reorderSections(draggedSection, index);
    setDraggedSection(index);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {sectionOrder.map((section, index) => (
            <div 
              key={section}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="relative group"
            >
              <div className="absolute -top-2 -right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => deleteSection(section)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
              <div className="cursor-move flex items-center justify-center absolute -top-2 -left-2 w-8 h-8 rounded-full bg-editor-surface opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4" />
              </div>
              <VideoSection
                section={section}
                files={sections[section] || []}
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
          selectedCombinations={selectedCombinations}
        />

        <div className="flex justify-between items-start gap-4">
          <CombinationsList combinations={combinations} />
          <ExportControls
            isExporting={isExporting}
            isPaused={isPaused}
            combinations={combinations}
            selectedCombinations={selectedCombinations}
            onSelectCombination={handleSelectCombination}
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
