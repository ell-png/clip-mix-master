import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

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

  const getEstimatedDownloadTime = () => {
    if (timeRemaining === null) return 'Calculating...';
    if (timeRemaining <= 0) return 'Download starting soon...';
    return `Download begins in ${formatTimeRemaining(timeRemaining)}`;
  };

  return (
    <div className="mb-8 bg-editor-surface p-4 rounded-lg animate-fade-in">
      <Progress 
        value={exportProgress} 
        className="h-2 bg-editor-accent"
      />
      <div className="flex flex-col space-y-2 mt-3">
        <p className="text-editor-text text-sm">
          Exporting combination {currentExportIndex + 1} of {selectedCombinations.length} ({Math.round(exportProgress)}%)
        </p>
        <div className="flex items-center text-sm text-editor-highlight">
          <Clock className="w-4 h-4 mr-2" />
          <p>{getEstimatedDownloadTime()}</p>
        </div>
      </div>
    </div>
  );
};

export default ExportProgress;