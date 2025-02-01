import React from 'react';
import { Button } from './ui/button';
import { Play, PauseCircle, StopCircle, Edit3 } from 'lucide-react';

interface ExportButtonsProps {
  isExporting: boolean;
  isPaused: boolean;
  selectedCount: number;
  onSelectAll: () => void;
  onStartExport: () => void;
  onTogglePause: () => void;
  onStopExport: () => void;
  onRenameAll: () => void;
}

const ExportButtons = ({
  isExporting,
  isPaused,
  selectedCount,
  onSelectAll,
  onStartExport,
  onTogglePause,
  onStopExport,
  onRenameAll,
}: ExportButtonsProps) => {
  return (
    <>
      <Button
        onClick={onSelectAll}
        variant="outline"
        className="w-full flex items-center justify-center mb-2 text-editor-text"
      >
        <Play className="mr-2 h-4 w-4" />
        Export All
      </Button>

      <Button
        onClick={onStartExport}
        disabled={isExporting || selectedCount === 0}
        className="bg-editor-highlight hover:bg-editor-highlight/90 text-white w-full flex items-center justify-center"
      >
        <Play className="mr-2 h-4 w-4" />
        <span>Export Selected ({selectedCount})</span>
      </Button>

      {isExporting && (
        <>
          <Button 
            onClick={onTogglePause} 
            variant="outline" 
            className="w-full flex items-center justify-center"
          >
            {isPaused ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                <span>Resume Export</span>
              </>
            ) : (
              <>
                <PauseCircle className="mr-2 h-4 w-4" />
                <span>Pause Export</span>
              </>
            )}
          </Button>
          <Button 
            onClick={onStopExport} 
            variant="destructive" 
            className="w-full flex items-center justify-center"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            <span>Stop Export</span>
          </Button>
        </>
      )}

      <Button 
        onClick={onRenameAll} 
        variant="outline"
        className="w-full flex items-center justify-center"
      >
        <Edit3 className="mr-2 h-4 w-4" />
        <span>Rename All</span>
      </Button>
    </>
  );
};

export default ExportButtons;