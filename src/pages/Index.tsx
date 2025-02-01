import React, { useState, useCallback } from 'react';
import VideoUploader from '@/components/VideoUploader';
import Timeline from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Shuffle, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState({
    hook: [] as File[],
    sellingPoint: [] as File[],
    cta: [] as File[],
  });

  const handleUpload = useCallback((section: keyof typeof sections, file: File) => {
    setSections(prev => ({
      ...prev,
      [section]: [...prev[section], file]
    }));
    toast({
      title: "Video uploaded",
      description: `Added to ${section} section`,
    });
  }, [toast]);

  const handleRandomize = () => {
    const randomSelection = {
      hook: sections.hook[Math.floor(Math.random() * sections.hook.length)] || null,
      sellingPoint: sections.sellingPoint[Math.floor(Math.random() * sections.sellingPoint.length)] || null,
      cta: sections.cta[Math.floor(Math.random() * sections.cta.length)] || null,
    };

    toast({
      title: "Clips randomized",
      description: "New sequence generated",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your video will be ready soon",
    });
  };

  return (
    <div className="min-h-screen bg-editor-bg text-editor-text p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">Video Editor</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-slide-up">
          <div>
            <h2 className="text-xl mb-4">Hook ({sections.hook.length} clips)</h2>
            <VideoUploader section="hook" onUpload={(file) => handleUpload('hook', file)} />
            {sections.hook.length > 0 && (
              <div className="mt-4 space-y-2">
                {sections.hook.map((file, index) => (
                  <div key={index} className="text-sm text-editor-muted truncate">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl mb-4">Selling Point ({sections.sellingPoint.length} clips)</h2>
            <VideoUploader section="selling-point" onUpload={(file) => handleUpload('sellingPoint', file)} />
            {sections.sellingPoint.length > 0 && (
              <div className="mt-4 space-y-2">
                {sections.sellingPoint.map((file, index) => (
                  <div key={index} className="text-sm text-editor-muted truncate">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl mb-4">CTA ({sections.cta.length} clips)</h2>
            <VideoUploader section="cta" onUpload={(file) => handleUpload('cta', file)} />
            {sections.cta.length > 0 && (
              <div className="mt-4 space-y-2">
                {sections.cta.map((file, index) => (
                  <div key={index} className="text-sm text-editor-muted truncate">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl mb-4">Timeline</h2>
          <Timeline sections={sections} />
        </div>

        <div className="flex justify-end gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button
            variant="outline"
            onClick={handleRandomize}
            className="bg-editor-surface hover:bg-editor-accent text-editor-text"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Randomize
          </Button>
          <Button
            onClick={handleExport}
            className="bg-editor-highlight hover:bg-editor-highlight/90 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Video
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;