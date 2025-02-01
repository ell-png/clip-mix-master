import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface VideoSections {
  [key: string]: File[];
}

export const useVideoSections = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<VideoSections>({
    hook: [],
    sellingPoint: [],
    cta: [],
  });

  const handleUpload = useCallback((section: string, file: File) => {
    setSections(prev => ({
      ...prev,
      [section]: [...prev[section], file]
    }));
    toast({
      title: "Video uploaded",
      description: `Added to ${section} section`,
    });
  }, [toast]);

  const handleRename = useCallback((section: string, index: number, newName: string) => {
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

  const handleDelete = useCallback((section: string, index: number) => {
    setSections(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
    toast({
      title: "Video deleted",
      description: `Removed from ${section} section`,
    });
  }, [toast]);

  const addSection = useCallback((sectionName: string) => {
    setSections(prev => ({
      ...prev,
      [sectionName]: []
    }));
    toast({
      title: "Section added",
      description: `Added new section: ${sectionName}`,
    });
  }, [toast]);

  const deleteSection = useCallback((sectionName: string) => {
    setSections(prev => {
      const newSections = { ...prev };
      delete newSections[sectionName];
      return newSections;
    });
    toast({
      title: "Section deleted",
      description: `Deleted section: ${sectionName}`,
    });
  }, [toast]);

  return {
    sections,
    handleUpload,
    handleRename,
    handleDelete,
    addSection,
    deleteSection
  };
};