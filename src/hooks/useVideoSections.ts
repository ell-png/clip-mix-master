import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface VideoSections {
  hook: File[];
  sellingPoint: File[];
  cta: File[];
}

export const useVideoSections = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<VideoSections>({
    hook: [],
    sellingPoint: [],
    cta: [],
  });

  const handleUpload = useCallback((section: keyof VideoSections, file: File) => {
    setSections(prev => ({
      ...prev,
      [section]: [...prev[section], file]
    }));
    toast({
      title: "Video uploaded",
      description: `Added to ${section} section`,
    });
  }, [toast]);

  const handleRename = useCallback((section: keyof VideoSections, index: number, newName: string) => {
    setSections(prev => {
      const newSections = { ...prev };
      const file = newSections[section][index];
      const newFile = new File([file], `${newName}${file.name.substring(file.name.lastIndexOf('.'))}`, {
        type: file.type,
      });
      newSections[section][index] = newFile;
      return newSections;
    });
  }, []);

  const handleRenameAll = useCallback(() => {
    setSections(prev => {
      const newSections = { ...prev };
      Object.keys(newSections).forEach(section => {
        newSections[section as keyof VideoSections] = newSections[section as keyof VideoSections].map((file: File, index: number) => {
          const newFile = new File([file], `${section}_${index + 1}${file.name.substring(file.name.lastIndexOf('.'))}`, {
            type: file.type,
          });
          return newFile;
        });
      });
      return newSections;
    });
    toast({
      title: "Files renamed",
      description: "All files have been renamed with sequential numbers",
    });
  }, [toast]);

  return {
    sections,
    handleUpload,
    handleRename,
    handleRenameAll
  };
};