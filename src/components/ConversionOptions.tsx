
import React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ConversionFormat, downloadMultipleBlobs } from "@/utils/imageUtils";
import { Download, RefreshCcw, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ConversionOptionsProps {
  files: File[];
  convertedBlobs: { blob: Blob, originalFile: File }[] | null;
  selectedFormat: ConversionFormat;
  isConverting: boolean;
  onFormatChange: (format: ConversionFormat) => void;
  onConvert: () => void;
}

const ConversionOptions: React.FC<ConversionOptionsProps> = ({
  files,
  convertedBlobs,
  selectedFormat,
  isConverting,
  onFormatChange,
  onConvert,
}) => {
  const handleDownload = async () => {
    if (!files.length || !convertedBlobs?.length) return;
    
    await downloadMultipleBlobs(convertedBlobs, selectedFormat);
    
    toast.success(`${convertedBlobs.length} ${convertedBlobs.length === 1 ? 'file' : 'files'} downloaded successfully!`);
    
    // Create confetti effect on download
    createConfetti();
  };
  
  const createConfetti = () => {
    const confettiCount = 100;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    
    const colors = [
      'bg-wizard-purple',
      'bg-wizard-pink',
      'bg-wizard-blue',
      'bg-wizard-orange',
      'bg-pink-400',
      'bg-indigo-400',
      'bg-blue-400',
    ];
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confetti.className = `confetti-piece ${color}`;
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      
      container.appendChild(confetti);
    }
    
    setTimeout(() => {
      document.body.removeChild(container);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Conversion Options</h3>
        
        <RadioGroup 
          value={selectedFormat} 
          onValueChange={(value) => onFormatChange(value as ConversionFormat)}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
            <RadioGroupItem value="png" id="png" />
            <Label htmlFor="png" className="cursor-pointer">PNG (transparent background)</Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
            <RadioGroupItem value="jpeg" id="jpeg" />
            <Label htmlFor="jpeg" className="cursor-pointer">JPG (smaller file size)</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onConvert}
          disabled={!files.length || isConverting}
          className="btn-gradient flex-1 py-6"
        >
          {isConverting ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Converting {files.length} {files.length === 1 ? 'file' : 'files'}...
            </>
          ) : convertedBlobs?.length ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Converted to {selectedFormat.toUpperCase()}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Convert {files.length} {files.length === 1 ? 'file' : 'files'} to {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>
        
        <Button
          onClick={handleDownload}
          disabled={!convertedBlobs?.length || isConverting}
          variant="outline"
          className="flex-1 py-6 border-2 hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <Download className="mr-2 h-4 w-4" />
          Download {convertedBlobs?.length || 0} {convertedBlobs?.length === 1 ? 'file' : 'files'}
        </Button>
      </div>
      
      {files.length > 1 && (
        <div className="p-3 bg-muted/30 rounded-md flex items-center border border-muted">
          <Loader2 className="w-4 h-4 mr-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Converting multiple files may take longer depending on their size
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversionOptions;
