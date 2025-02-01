import React from 'react';
import { Button } from './ui/button';
import { Plus, Minus, GripVertical, Edit } from 'lucide-react';
import VideoSection from './VideoSection';

interface SectionManagerProps {
  sections: { [key: string]: File[] };
  sectionOrder: string[];
  draggedSection: number | null;
  onUpload: (section: string, file: File) => void;
  onRename: (section: string, index: number) => void;
  onDelete: (section: string, index: number) => void;
  onAddSectionClick: () => void;
  onDeleteSection: (section: string) => void;
  onSectionRename: (section: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onMoveVideo: (fromSection: string, toSection: string, fileIndex: number) => void;
}

const SectionManager = ({
  sections,
  sectionOrder,
  draggedSection,
  onUpload,
  onRename,
  onDelete,
  onAddSectionClick,
  onDeleteSection,
  onSectionRename,
  onDragStart,
  onDragOver,
  onDragEnd,
  onMoveVideo
}: SectionManagerProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Video Editor</h1>
        <Button onClick={onAddSectionClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {sectionOrder.map((section, index) => (
          <div 
            key={section}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            className="relative group"
          >
            <div className="absolute -top-2 -right-2 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSectionRename(section)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => onDeleteSection(section)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            <div className="cursor-move flex items-center justify-center absolute -top-2 -left-2 w-8 h-8 rounded-full bg-editor-surface opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4" />
            </div>
            <VideoSection
              section={section}
              files={sections[section] || []}
              onUpload={onUpload}
              onRename={onRename}
              onDelete={onDelete}
              onMoveVideo={onMoveVideo}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default SectionManager;