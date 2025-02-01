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
    <div className="mb-8 bg-editor-surface p-4 rounded-lg animate-fade-in">
      <Progress 
        value={exportProgress} 
        className="h-2 bg-editor-accent"
      />
      <div className="flex flex-col sm:flex-row sm:justify-between text-sm mt-2 space-y-2 sm:space-y-0">
        <p className="text-editor-text">
          Exporting combination {currentExportIndex + 1} of {selectedCombinations.length} ({Math.round(exportProgress)}%)
        </p>
        {timeRemaining !== null && timeRemaining > 0 && (
          <p className="text-editor-highlight font-medium">
            Time remaining: {formatTimeRemaining(timeRemaining)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExportProgress;