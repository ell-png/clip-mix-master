import React from 'react';
import VideoUploader from './VideoUploader';
import { Button } from './ui/button';
import { Edit2 } from 'lucide-react';

interface VideoSectionProps {
  section: string;
  files: File[];
  onUpload: (section: string, file: File) => void;
  onRename: (section: string, index: number) => void;
}

const VideoSection = ({ section, files, onUpload, onRename }: VideoSectionProps) => {
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
            <div key={index} className="flex items-center justify-between text-sm text-editor-muted">
              <span className="truncate flex-1">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRename(section, index)}
                className="ml-2"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoSection;