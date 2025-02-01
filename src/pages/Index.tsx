import React, { useState, useCallback, useEffect } from 'react';
import VideoUploader from '@/components/VideoUploader';
import Timeline from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Play, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface VideoSelection {
  hook: File | null;
  sellingPoint: File | null;
  cta: File | null;
}

interface Combination {
  hook: File;
  sellingPoint: File;
  cta: File;
  exported: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState({
    hook: [] as File[],
    sellingPoint: [] as File[],
    cta: [] as File[],
  });
  
  const [currentCombination, setCurrentCombination] = useState<VideoSelection>({
    hook: null,
    sellingPoint: null,
    cta: null,
  });
  
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [currentExportIndex, setCurrentExportIndex] = useState(0);

  // Generate all possible combinations when clips are added
  const generateCombinations = useCallback(() => {
    const newCombinations: Combination[] = [];
    sections.hook.forEach(hook => {
      sections.sellingPoint.forEach(sellingPoint => {
        sections.cta.forEach(cta => {
          newCombinations.push({
            hook,
            sellingPoint,
            cta,
            exported: false
          });
        });
      });
    });
    setCombinations(newCombinations);
  }, [sections]);

  useEffect(() => {
    generateCombinations();
  }, [sections, generateCombinations]);

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

  const exportCombination = useCallback((combination: Combination, index: number) => {
    setCurrentCombination({
      hook: combination.hook,
      sellingPoint: combination.sellingPoint,
      cta: combination.cta,
    });

    // Simulate export progress for this combination
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setExportProgress(progress);
      } else {
        clearInterval(interval);
        setCombinations(prev => 
          prev.map((c, i) => i === index ? { ...c, exported: true } : c)
        );
        
        // Move to next combination
        if (index < combinations.length - 1) {
          setCurrentExportIndex(index + 1);
        } else {
          setIsExporting(false);
          toast({
            title: "Export complete",
            description: `Successfully exported ${combinations.length} video combinations`,
          });
        }
      }
    }, 500);
  }, [combinations.length, toast]);

  const startExport = useCallback(() => {
    if (combinations.length === 0) {
      toast({
        title: "No combinations available",
        description: "Please upload at least one video to each section",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setCurrentExportIndex(0);
    setExportProgress(0);
    
    // Reset export status
    setCombinations(prev => prev.map(c => ({ ...c, exported: false })));
  }, [combinations.length, toast]);

  // Start exporting the current combination when currentExportIndex changes
  useEffect(() => {
    if (isExporting && combinations[currentExportIndex]) {
      exportCombination(combinations[currentExportIndex], currentExportIndex);
    }
  }, [isExporting, currentExportIndex, combinations, exportCombination]);

  return (
    <div className="min-h-screen bg-editor-bg text-editor-text p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Video Editor</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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

        <div className="mb-8">
          <h2 className="text-xl mb-4">Timeline</h2>
          <Timeline sections={sections} currentSelection={currentCombination} />
        </div>

        {isExporting && (
          <div className="mb-8">
            <Progress value={exportProgress} className="h-2" />
            <p className="text-sm text-editor-muted mt-2">
              Exporting combination {currentExportIndex + 1} of {combinations.length} ({exportProgress}%)
            </p>
          </div>
        )}

        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 bg-editor-surface p-4 rounded-lg">
            <h3 className="text-lg mb-4">All Combinations ({combinations.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {combinations.map((combo, index) => (
                <div 
                  key={index} 
                  className={`text-sm p-2 rounded ${
                    combo.exported ? 'bg-editor-accent text-editor-muted' : 'bg-editor-bg'
                  }`}
                >
                  {combo.hook.name} → {combo.sellingPoint.name} → {combo.cta.name}
                  {combo.exported && ' (Exported)'}
                </div>
              ))}
            </div>
          </div>
          
          <Button
            onClick={startExport}
            disabled={isExporting || combinations.length === 0}
            className="bg-editor-highlight hover:bg-editor-highlight/90 text-white"
          >
            <Play className="mr-2 h-4 w-4" />
            Export All Combinations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;