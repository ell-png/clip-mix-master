export interface VideoFile {
  id: number;
  hook: File;
  sellingPoint: File;
  cta: File;
  exported: boolean;
}

export interface VideoSelection {
  hook: File | null;
  sellingPoint: File | null;
  cta: File | null;
}

export interface ExportProgress {
  percent: number;
  timeRemaining: number | null;
  startTime: number | null;
}

export interface ExportOptions {
  quality: 'low' | 'medium' | 'high';
  speed: 'slow' | 'medium' | 'fast';
  preset: string;
  threads: number;
}