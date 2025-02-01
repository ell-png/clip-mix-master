import React, { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface VideoUploaderProps {
  section: 'hook' | 'selling-point' | 'cta';
  onUpload: (file: File) => void;
}

const VideoUploader = ({ section, onUpload }: VideoUploaderProps) => {
  const { toast } = useToast();
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('video/')) {
        onUpload(file);
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload video files only",
          variant: "destructive",
        });
      }
    });
  }, [onUpload, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    files.forEach(file => {
      if (file.type.startsWith('video/')) {
        onUpload(file);
      }
    });
  }, [onUpload]);

  return (
    <div
      className="border-2 border-dashed border-editor-accent rounded-lg p-8 text-center cursor-pointer hover:border-editor-highlight transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => document.getElementById(`file-input-${section}`)?.click()}
    >
      <Upload className="mx-auto mb-4 text-editor-muted" size={24} />
      <p className="text-editor-text mb-2">Drop videos here or click to upload</p>
      <p className="text-editor-muted text-sm">Supports MP4, WebM, MOV</p>
      <input
        id={`file-input-${section}`}
        type="file"
        className="hidden"
        accept="video/*"
        multiple
        onChange={handleFileInput}
      />
    </div>
  );
};

export default VideoUploader;