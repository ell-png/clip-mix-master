import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface VideoSections {
  [key: string]: File[];
}

export const useVideoSections = () => {
  const { toast } = useToast();
  const [sectionOrder, setSectionOrder] = useState<string[]>(['hook', 'sellingPoint', 'cta']);
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

  const moveVideo = useCallback((fromSection: string, toSection: string, fileIndex: number) => {
    setSections(prev => {
      const newSections = { ...prev };
      const [movedFile] = newSections[fromSection].splice(fileIndex, 1);
      newSections[toSection].push(movedFile);
      return newSections;
    });
    toast({
      title: "Video moved",
      description: `Moved from ${fromSection} to ${toSection}`,
    });
  }, [toast]);

  const addSection = useCallback((sectionName: string) => {
    setSections(prev => ({
      ...prev,
      [sectionName]: []
    }));
    setSectionOrder(prev => [...prev, sectionName]);
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
    setSectionOrder(prev => prev.filter(section => section !== sectionName));
    toast({
      title: "Section deleted",
      description: `Deleted section: ${sectionName}`,
    });
  }, [toast]);

  const reorderSections = useCallback((startIndex: number, endIndex: number) => {
    setSectionOrder(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
    toast({
      title: "Sections reordered",
      description: "Section order updated successfully",
    });
  }, [toast]);

  const renameSection = useCallback((oldName: string, newName: string) => {
    setSections(prev => {
      const newSections = { ...prev };
      newSections[newName] = prev[oldName];
      delete newSections[oldName];
      return newSections;
    });
    setSectionOrder(prev => prev.map(section => section === oldName ? newName : section));
    toast({
      title: "Section renamed",
      description: `Renamed from ${oldName} to ${newName}`,
    });
  }, [toast]);

  return {
    sections,
    sectionOrder,
    handleUpload,
    handleRename,
    handleDelete,
    addSection,
    deleteSection,
    reorderSections,
    renameSection,
    moveVideo
  };
};
