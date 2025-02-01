import React, { useState, useEffect } from 'react';
import { useVideoExport } from '@/hooks/useVideoExport';
import { useVideoSections } from '@/hooks/useVideoSections';
import SectionManager from '@/components/SectionManager';
import DialogManager from '@/components/DialogManager';
import ExportControls from '@/components/ExportControls';
import CombinationsList from '@/components/CombinationsList';
import ExportProgress from '@/components/ExportProgress';
import { useToast } from '@/components/ui/use-toast';

interface Combination {
  id: number;
  hook: File;
  sellingPoint: File;
  cta: File;
  exported: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [selectedCombinations, setSelectedCombinations] = useState<number[]>([]);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const {
    sections,
    sectionOrder,
    handleUpload,
    handleRename,
    handleDelete,
    addSection,
    deleteSection,
    reorderSections,
    renameSection,
    moveVideo
  } = useVideoSections();

  const {
    isExporting,
    isPaused,
    exportProgress,
    timeRemaining,
    currentExportIndex,
    stopExport,
    togglePause,
    startExport,
    exportCombination,
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
  }, [sections]);

  const handleSelectCombination = (id: number) => {
    setSelectedCombinations(prev => 
      prev.includes(id)
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCombinations.length === combinations.length) {
      setSelectedCombinations([]);
    } else {
      setSelectedCombinations(combinations.map(c => c.id));
    }
  };

  const handleExportAll = () => {
    if (combinations.length === 0) {
      toast({
        title: "No combinations available",
        description: "Please add videos to create combinations first.",
        variant: "destructive"
      });
      return;
    }
    startExport();
  };

  const handleRenameAll = () => {
    if (combinations.length === 0) {
      toast({
        title: "No videos to rename",
        description: "Please add videos first.",
        variant: "destructive"
      });
      return;
    }
    setIsRenameDialogOpen(true);
  };

  const confirmRenameAll = () => {
    if (!newFileName) return;
    
    combinations.forEach((combination, index) => {
      const newName = `${newFileName}_${index + 1}`;
      handleRename('hook', index, newName);
      handleRename('sellingPoint', index, newName);
      handleRename('cta', index, newName);
    });
    
    setIsRenameDialogOpen(false);
    setNewFileName('');
    toast({
      title: "Videos renamed",
      description: "All videos have been renamed successfully."
    });
  };

  return (
    <div className="min-h-screen bg-editor-bg text-editor-text p-8">
      <div className="max-w-6xl mx-auto">
        <SectionManager
          sections={sections}
          sectionOrder={sectionOrder}
          onUpload={handleUpload}
          onRename={(section, index) => handleRename(section, index, '')}
          onDelete={handleDelete}
          onAddSectionClick={() => {}}
          onDeleteSection={deleteSection}
          onSectionRename={(oldName, newName) => renameSection(oldName, newName)}
          onMoveVideo={moveVideo}
        />

        <ExportProgress
          isExporting={isExporting}
          exportProgress={exportProgress}
          currentExportIndex={currentExportIndex}
          selectedCombinations={selectedCombinations}
          timeRemaining={timeRemaining}
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
            onExportAll={handleExportAll}
            onTogglePause={togglePause}
            onStopExport={stopExport}
            onRenameAll={handleRenameAll}
            onSelectAll={handleSelectAll}
          />
        </div>
      </div>

      <DialogManager
        isRenameDialogOpen={isRenameDialogOpen}
        setIsRenameDialogOpen={setIsRenameDialogOpen}
        newFileName={newFileName}
        setNewFileName={setNewFileName}
        onConfirmRename={confirmRenameAll}
      />
    </div>
  );
};

export default Index;