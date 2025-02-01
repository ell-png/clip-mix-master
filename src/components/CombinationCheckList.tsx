import React from 'react';
import { Checkbox } from './ui/checkbox';
import { VideoFile } from '@/types/video';

interface CombinationCheckListProps {
  combinations: VideoFile[];
  selectedCombinations: number[];
  onSelectCombination: (id: number) => void;
}

const CombinationCheckList = ({
  combinations,
  selectedCombinations,
  onSelectCombination,
}: CombinationCheckListProps) => {
  return (
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
  );
};

export default CombinationCheckList;