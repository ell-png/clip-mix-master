import React from 'react';
import VideoUploader from './VideoUploader';
import { Button } from './ui/button';
import { Edit2, Trash2, GripVertical } from 'lucide-react';

interface VideoSectionProps {
  section: string;
  files: File[];
  onUpload: (section: string, file: File) => void;
  onRename: (section: string, index: number) => void;
  onDelete: (section: string, index: number) => void;
  onMoveVideo: (fromSection: string, toSection: string, fileIndex: number) => void;
}

const VideoSection = ({ section, files, onUpload, onRename, onDelete, onMoveVideo }: VideoSectionProps) => {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      sourceSection: section,
      fileIndex: index
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.sourceSection && typeof data.fileIndex === 'number') {
        onMoveVideo(data.sourceSection, section, data.fileIndex);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h2 className="text-xl mb-4">{section} ({files.length} clips)</h2>
      <VideoUploader 
        section={section as 'hook' | 'selling-point' | 'cta'} 
        onUpload={(file) => onUpload(section, file)} 
      />
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between text-sm text-editor-muted bg-editor-surface p-2 rounded cursor-move hover:bg-editor-accent/50 transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
            >
              <div className="flex items-center gap-2 flex-1">
                <GripVertical className="h-4 w-4 text-editor-muted" />
                <span className="truncate">{file.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRename(section, index)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(section, index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoSection;