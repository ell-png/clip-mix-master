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
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onUpload(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a video file",
        variant: "destructive",
      });
    }
  }, [onUpload, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <div
      className="border-2 border-dashed border-editor-accent rounded-lg p-8 text-center cursor-pointer hover:border-editor-highlight transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => document.getElementById(`file-input-${section}`)?.click()}
    >
      <Upload className="mx-auto mb-4 text-editor-muted" size={24} />
      <p className="text-editor-text mb-2">Drop video here or click to upload</p>
      <p className="text-editor-muted text-sm">Supports MP4, WebM, MOV</p>
      <input
        id={`file-input-${section}`}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={handleFileInput}
      />
    </div>
  );
};

export default VideoUploader;