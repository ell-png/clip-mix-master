import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ExportProgressProps {
  isExporting: boolean;
  exportProgress: number;
  currentExportIndex: number;
  selectedCombinations: number[];
  timeRemaining: number | null;
}

const ExportProgress = ({
  isExporting,
  exportProgress,
  currentExportIndex,
  selectedCombinations,
  timeRemaining,
}: ExportProgressProps) => {
  if (!isExporting) return null;

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="mb-8">
      <Progress value={exportProgress} className="h-2" />
      <div className="flex justify-between text-sm text-editor-muted mt-2">
        <p>
          Exporting combination {currentExportIndex + 1} of {selectedCombinations.length} ({Math.round(exportProgress)}%)
        </p>
        {timeRemaining !== null && (
          <p>
            Estimated time remaining: {formatTimeRemaining(timeRemaining)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExportProgress;