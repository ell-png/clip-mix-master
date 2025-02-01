import React from 'react';
import { Button } from './ui/button';
import { CheckSquare, Play, PauseCircle, StopCircle, Edit3 } from 'lucide-react';

interface ExportButtonsProps {
  isExporting: boolean;
  isPaused: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onStartExport: () => void;
  onExportAll: () => void;
  onTogglePause: () => void;
  onStopExport: () => void;
  onRenameAll: () => void;
}

const ExportButtons = ({
  isExporting,
  isPaused,
  selectedCount,
  totalCount,
  onSelectAll,
  onStartExport,
  onExportAll,
  onTogglePause,
  onStopExport,
  onRenameAll,
}: ExportButtonsProps) => {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const handleExportAll = () => {
    console.log('Triggering export all with total combinations:', totalCount);
    onExportAll();
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={onSelectAll}
        variant="outline"
        className="w-full flex items-center justify-center bg-editor-surface text-editor-text hover:bg-editor-accent hover:text-editor-text"
      >
        <CheckSquare className="mr-2 h-4 w-4" />
        {isAllSelected ? 'Deselect All Videos' : 'Select All Videos'}
      </Button>

      <Button
        onClick={handleExportAll}
        variant="outline"
        disabled={isExporting || totalCount === 0}
        className="w-full flex items-center justify-center bg-editor-surface text-editor-text hover:bg-editor-accent hover:text-editor-text"
      >
        <Play className="mr-2 h-4 w-4" />
        Export All Videos ({totalCount})
      </Button>

      <Button
        onClick={onStartExport}
        disabled={isExporting || selectedCount === 0}
        className="w-full flex items-center justify-center bg-editor-highlight hover:bg-editor-highlight/90 text-white"
      >
        <Play className="mr-2 h-4 w-4" />
        Export Selected ({selectedCount})
      </Button>

      {isExporting && (
        <>
          <Button 
            onClick={onTogglePause} 
            variant="outline" 
            className="w-full flex items-center justify-center bg-editor-surface text-editor-text hover:bg-editor-accent hover:text-editor-text"
          >
            {isPaused ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume Export
              </>
            ) : (
              <>
                <PauseCircle className="mr-2 h-4 w-4" />
                Pause Export
              </>
            )}
          </Button>
          <Button 
            onClick={onStopExport} 
            variant="destructive" 
            className="w-full flex items-center justify-center bg-destructive hover:bg-destructive/90 text-white"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Export
          </Button>
        </>
      )}

      <Button 
        onClick={onRenameAll} 
        variant="outline"
        className="w-full flex items-center justify-center bg-editor-surface text-editor-text hover:bg-editor-accent hover:text-editor-text"
      >
        <Edit3 className="mr-2 h-4 w-4" />
        Rename All Videos
      </Button>
    </div>
  );
};

export default ExportButtons;