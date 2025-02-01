import React from 'react';
import { VideoFile } from '@/types/video';
import CombinationCheckList from './CombinationCheckList';
import ExportButtons from './ExportButtons';

interface ExportControlsProps {
  isExporting: boolean;
  isPaused: boolean;
  combinations: VideoFile[];
  selectedCombinations: number[];
  onSelectCombination: (id: number) => void;
  onStartExport: () => void;
  onTogglePause: () => void;
  onStopExport: () => void;
  onRenameAll: () => void;
  onSelectAll: () => void;
  onExportAll: () => void;
}

const ExportControls = ({
  isExporting,
  isPaused,
  combinations,
  selectedCombinations,
  onSelectCombination,
  onStartExport,
  onTogglePause,
  onStopExport,
  onRenameAll,
  onSelectAll,
  onExportAll,
}: ExportControlsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <CombinationCheckList
        combinations={combinations}
        selectedCombinations={selectedCombinations}
        onSelectCombination={onSelectCombination}
      />
      <ExportButtons
        isExporting={isExporting}
        isPaused={isPaused}
        selectedCount={selectedCombinations.length}
        onSelectAll={onSelectAll}
        onStartExport={onStartExport}
        onExportAll={onExportAll}
        onTogglePause={onTogglePause}
        onStopExport={onStopExport}
        onRenameAll={onRenameAll}
      />
    </div>
  );
};

export default ExportControls;