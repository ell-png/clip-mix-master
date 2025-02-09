import React from 'react';
import { Video } from 'lucide-react';

interface TimelineProps {
  sections: {
    hook: File[];
    sellingPoint: File[];
    cta: File[];
  };
  currentSelection: {
    hook: File | null;
    sellingPoint: File | null;
    cta: File | null;
  };
}

const Timeline = ({ sections, currentSelection }: TimelineProps) => {
  return (
    <div className="bg-editor-surface p-4 rounded-lg">
      <div className="flex gap-2">
        {Object.entries(sections).map(([section, files]) => {
          const currentFile = currentSelection[section as keyof typeof currentSelection];
          
          return (
            <div
              key={section}
              className={`flex-1 h-20 rounded ${
                files.length > 0 ? 'bg-editor-highlight' : 'bg-editor-accent'
              } p-2 transition-colors`}
            >
              {files.length > 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-white text-sm mb-1">{files.length} clips</span>
                  {currentFile && (
                    <span className="text-xs text-editor-text truncate max-w-full">
                      Selected: {currentFile.name}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Video className="text-editor-muted" size={24} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-editor-muted text-sm">
        <span>Hook</span>
        <span>Selling Point</span>
        <span>CTA</span>
      </div>
    </div>
  );
};

export default Timeline;