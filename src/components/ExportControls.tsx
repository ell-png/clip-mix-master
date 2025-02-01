import React from 'react';
import { Button } from './ui/button';
import { Play, PauseCircle, StopCircle, Edit3 } from 'lucide-react';

interface ExportControlsProps {
  isExporting: boolean;
  isPaused: boolean;
  combinationsLength: number;
  onStartExport: () => void;
  onTogglePause: () => void;
  onStopExport: () => void;
  onRenameAll: () => void;
}

const ExportControls = ({
  isExporting,
  isPaused,
  combinationsLength,
  onStartExport,
  onTogglePause,
  onStopExport,
  onRenameAll,
}: ExportControlsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={onStartExport}
        disabled={isExporting || combinationsLength === 0}
        className="bg-editor-highlight hover:bg-editor-highlight/90 text-white"
      >
        <Play className="mr-2 h-4 w-4" />
        Export All Combinations
      </Button>

      {isExporting && (
        <>
          <Button onClick={onTogglePause} variant="outline">
            <PauseCircle className="mr-2 h-4 w-4" />
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button onClick={onStopExport} variant="destructive">
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Export
          </Button>
        </>
      )}

      <Button 
        onClick={onRenameAll} 
        variant="outline"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <Edit3 className="mr-2 h-4 w-4" />
        Rename All
      </Button>
    </div>
  );
};

export default ExportControls;