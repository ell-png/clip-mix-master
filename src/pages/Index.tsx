import React, { useState, useCallback } from 'react';
import VideoUploader from '@/components/VideoUploader';
import Timeline from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Shuffle, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface VideoSelection {
  hook: File | null;
  sellingPoint: File | null;
  cta: File | null;
}

interface Combination {
  hook: string;
  sellingPoint: string;
  cta: string;
  used: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState({
    hook: [] as File[],
    sellingPoint: [] as File[],
    cta: [] as File[],
  });
  const [currentSelection, setCurrentSelection] = useState<VideoSelection>({
    hook: null,
    sellingPoint: null,
    cta: null,
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [combinations, setCombinations] = useState<Combination[]>([]);

  const generateCombinations = useCallback(() => {
    const newCombinations: Combination[] = [];
    sections.hook.forEach(hook => {
      sections.sellingPoint.forEach(sellingPoint => {
        sections.cta.forEach(cta => {
          newCombinations.push({
            hook: hook.name,
            sellingPoint: sellingPoint.name,
            cta: cta.name,
            used: false
          });
        });
      });
    });
    setCombinations(newCombinations);
  }, [sections]);

  const handleUpload = useCallback((section: keyof typeof sections, file: File) => {
    setSections(prev => ({
      ...prev,
      [section]: [...prev[section], file]
    }));
    toast({
      title: "Video uploaded",
      description: `Added to ${section} section`,
    });
    
    // Generate new combinations when clips are added
    setTimeout(generateCombinations, 0);
  }, [toast, generateCombinations]);

  const getUnusedCombination = () => {
    const unusedCombinations = combinations.filter(c => !c.used);
    if (unusedCombinations.length === 0) {
      toast({
        title: "All combinations used",
        description: "Resetting combinations to start over",
      });
      setCombinations(prev => prev.map(c => ({ ...c, used: false })));
      return combinations[0];
    }
    return unusedCombinations[Math.floor(Math.random() * unusedCombinations.length)];
  };

  const handleRandomize = () => {
    const combination = getUnusedCombination();
    if (!combination) return;

    const newSelection = {
      hook: sections.hook.find(f => f.name === combination.hook) || null,
      sellingPoint: sections.sellingPoint.find(f => f.name === combination.sellingPoint) || null,
      cta: sections.cta.find(f => f.name === combination.cta) || null,
    };

    setCurrentSelection(newSelection);
    setCombinations(prev => 
      prev.map(c => 
        c.hook === combination.hook && 
        c.sellingPoint === combination.sellingPoint && 
        c.cta === combination.cta 
          ? { ...c, used: true }
          : c
      )
    );

    toast({
      title: "New combination selected",
      description: "Preview updated in timeline",
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          toast({
            title: "Export complete",
            description: "Your video has been exported successfully",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
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
          <Timeline sections={sections} currentSelection={currentSelection} />
        </div>

        {isExporting && (
          <div className="mb-8">
            <Progress value={exportProgress} className="h-2" />
            <p className="text-sm text-editor-muted mt-2">Exporting video: {exportProgress}%</p>
          </div>
        )}

        <div className="flex justify-between items-start gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex-1 bg-editor-surface p-4 rounded-lg">
            <h3 className="text-lg mb-4">Available Combinations</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {combinations.map((combo, index) => (
                <div 
                  key={index} 
                  className={`text-sm p-2 rounded ${combo.used ? 'bg-editor-accent text-editor-muted' : 'bg-editor-bg'}`}
                >
                  {combo.hook} → {combo.sellingPoint} → {combo.cta}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
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
              disabled={isExporting}
              className="bg-editor-highlight hover:bg-editor-highlight/90 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;