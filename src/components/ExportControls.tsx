import React from 'react';
import { Button } from './ui/button';
import { Play, PauseCircle, StopCircle, Edit3 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface ExportControlsProps {
  isExporting: boolean;
  isPaused: boolean;
  combinations: Array<{ id: number; exported: boolean }>;
  selectedCombinations: number[];
  onSelectCombination: (id: number) => void;
  onStartExport: () => void;
  onTogglePause: () => void;
  onStopExport: () => void;
  onRenameAll: () => void;
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
}: ExportControlsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-60 overflow-y-auto mb-4 bg-editor-surface p-4 rounded-lg">
        {combinations.map((combination, index) => (
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
              Combination {index + 1}
            </label>
          </div>
        ))}
      </div>

      <Button
        onClick={onStartExport}
        disabled={isExporting || selectedCombinations.length === 0}
        className="bg-editor-highlight hover:bg-editor-highlight/90 text-white"
      >
        <Play className="mr-2 h-4 w-4" />
        Export Selected ({selectedCombinations.length})
      </Button>

      {isExporting && (
        <>
          <Button onClick={onTogglePause} variant="outline" className="w-full">
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
          <Button onClick={onStopExport} variant="destructive" className="w-full">
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Export
          </Button>
        </>
      )}

      <Button 
        onClick={onRenameAll} 
        variant="outline"
        className="w-full"
      >
        <Edit3 className="mr-2 h-4 w-4" />
        Rename All
      </Button>
    </div>
  );
};

export default ExportControls;