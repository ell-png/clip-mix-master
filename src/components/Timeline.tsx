import React from 'react';
import { Video } from 'lucide-react';

interface TimelineProps {
  sections: {
    hook: File | null;
    sellingPoint: File | null;
    cta: File | null;
  };
}

const Timeline = ({ sections }: TimelineProps) => {
  return (
    <div className="bg-editor-surface p-4 rounded-lg">
      <div className="flex gap-2">
        {Object.entries(sections).map(([section, file]) => (
          <div
            key={section}
            className={`flex-1 h-20 rounded ${
              file ? 'bg-editor-highlight' : 'bg-editor-accent'
            } p-2 transition-colors`}
          >
            {file ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-white text-sm truncate">{file.name}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Video className="text-editor-muted" size={24} />
              </div>
            )}
          </div>
        ))}
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