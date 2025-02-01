import React from 'react';

interface Combination {
  hook: File;
  sellingPoint: File;
  cta: File;
  exported: boolean;
}

interface CombinationsListProps {
  combinations: Combination[];
}

const CombinationsList = ({ combinations }: CombinationsListProps) => {
  return (
    <div className="flex-1 bg-editor-surface p-4 rounded-lg">
      <h3 className="text-lg mb-4">All Combinations ({combinations.length})</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {combinations.map((combo, index) => (
          <div 
            key={index} 
            className={`text-sm p-2 rounded ${
              combo.exported ? 'bg-editor-accent text-editor-muted' : 'bg-editor-bg'
            }`}
          >
            {combo.hook.name} → {combo.sellingPoint.name} → {combo.cta.name}
            {combo.exported && ' (Exported)'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CombinationsList;