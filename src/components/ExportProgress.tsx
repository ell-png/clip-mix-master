import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ExportProgressProps {
  isExporting: boolean;
  exportProgress: number;
  currentExportIndex: number;
  selectedCombinations: number[];
}

const ExportProgress = ({
  isExporting,
  exportProgress,
  currentExportIndex,
  selectedCombinations,
}: ExportProgressProps) => {
  if (!isExporting) return null;

  return (
    <div className="mb-8">
      <Progress value={exportProgress} className="h-2" />
      <p className="text-sm text-editor-muted mt-2">
        Exporting combination {currentExportIndex + 1} of {selectedCombinations.length} ({Math.round(exportProgress)}%)
      </p>
    </div>
  );
};

export default ExportProgress;