import React, { useState, useEffect } from 'react';
import { useVideoExport } from '@/hooks/useVideoExport';
import { useVideoSections } from '@/hooks/useVideoSections';
import SectionManager from '@/components/SectionManager';
import DialogManager from '@/components/DialogManager';
import ExportControls from '@/components/ExportControls';
import CombinationsList from '@/components/CombinationsList';
import ExportProgress from '@/components/ExportProgress';

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
  const [isSectionRenameDialogOpen, setIsSectionRenameDialogOpen] = useState(false);
  const [sectionToRename, setSectionToRename] = useState<string | null>(null);

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
    setSelectedCombinations([]);
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

  const handleRenameClick = (section: string, index: number) => {
    setRenameTarget({ section, index });
    setNewFileName('');
    setIsRenameDialogOpen(true);
  };

  const handleAddSection = () => {
    if (!newSectionName) return;
    addSection(newSectionName);
    setIsAddSectionDialogOpen(false);
    setNewSectionName('');
  };

  const handleSectionRename = (section: string) => {
    setSectionToRename(section);
    setNewSectionName(section);
    setIsSectionRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (!renameTarget || !newFileName) return;
    handleRename(renameTarget.section, renameTarget.index, newFileName);
    setIsRenameDialogOpen(false);
    setRenameTarget(null);
    setNewFileName('');
  };

  const confirmSectionRename = () => {
    if (sectionToRename && newSectionName) {
      renameSection(sectionToRename, newSectionName);
      setIsSectionRenameDialogOpen(false);
      setSectionToRename(null);
      setNewSectionName('');
    }
  };

  const handleExportAll = () => {
    setSelectedCombinations(combinations.map(c => c.id));
    startExport();
  };

  return (
    <div className="min-h-screen bg-editor-bg text-editor-text p-8">
      <div className="max-w-6xl mx-auto">
        <SectionManager
          sections={sections}
          sectionOrder={sectionOrder}
          draggedSection={draggedSection}
          onUpload={handleUpload}
          onRename={handleRenameClick}
          onDelete={handleDelete}
          onAddSectionClick={() => setIsAddSectionDialogOpen(true)}
          onDeleteSection={deleteSection}
          onSectionRename={handleSectionRename}
          onDragStart={(index) => setDraggedSection(index)}
          onDragOver={(e, index) => {
            e.preventDefault();
            if (draggedSection === null || draggedSection === index) return;
            reorderSections(draggedSection, index);
            setDraggedSection(index);
          }}
          onDragEnd={() => setDraggedSection(null)}
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
            onRenameAll={() => {}}
            onSelectAll={handleSelectAll}
          />
        </div>
      </div>

      <DialogManager
        isRenameDialogOpen={isRenameDialogOpen}
        setIsRenameDialogOpen={setIsRenameDialogOpen}
        isAddSectionDialogOpen={isAddSectionDialogOpen}
        setIsAddSectionDialogOpen={setIsAddSectionDialogOpen}
        isSectionRenameDialogOpen={isSectionRenameDialogOpen}
        setIsSectionRenameDialogOpen={setIsSectionRenameDialogOpen}
        newFileName={newFileName}
        setNewFileName={setNewFileName}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
        onConfirmRename={confirmRename}
        onConfirmAddSection={handleAddSection}
        onConfirmSectionRename={confirmSectionRename}
      />
    </div>
  );
};

export default Index;
