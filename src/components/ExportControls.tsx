import React from 'react';
import { Button } from './ui/button';
import { Play, PauseCircle, StopCircle, Edit3 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { VideoFile } from '@/types/video';

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
}: ExportControlsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-60 overflow-y-auto mb-4 bg-editor-surface p-4 rounded-lg">
        {combinations.map((combination) => (
          <div key={combination.id} className="flex items-center space-x-2 mb-2">
            <Checkbox
              id={`combination-${combination.id}`}
              checked={selectedCombinations.includes(combination.id)}
              onCheckedChange={() => onSelectCombination(combination.id)}
            />
            <label
              htmlFor={`combination-${combination.id}`}
              className="text-sm text-editor-text cursor-pointer"
            >
              {combination.hook.name} → {combination.sellingPoint.name} → {combination.cta.name}
            </label>
          </div>
        ))}
      </div>

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
        disabled={isExporting || selectedCombinations.length === 0}
        className="bg-editor-highlight hover:bg-editor-highlight/90 text-white w-full flex items-center justify-center"
      >
        <Play className="mr-2 h-4 w-4" />
        <span>Export Selected ({selectedCombinations.length})</span>
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
    </div>
  );
};

export default ExportControls;