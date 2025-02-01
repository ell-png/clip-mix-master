import React from 'react';
import VideoUploader from './VideoUploader';
import { Button } from './ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface VideoSectionProps {
  section: string;
  files: File[];
  onUpload: (section: string, file: File) => void;
  onRename: (section: string, index: number) => void;
  onDelete: (section: string, index: number) => void;
}

const VideoSection = ({ section, files, onUpload, onRename, onDelete }: VideoSectionProps) => {
  return (
    <div>
      <h2 className="text-xl mb-4">{section} ({files.length} clips)</h2>
      <VideoUploader 
        section={section as 'hook' | 'selling-point' | 'cta'} 
        onUpload={(file) => onUpload(section, file)} 
      />
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between text-sm text-editor-muted bg-editor-surface p-2 rounded">
              <span className="truncate flex-1">{file.name}</span>
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