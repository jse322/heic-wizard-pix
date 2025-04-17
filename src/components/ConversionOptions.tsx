
import React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ConversionFormat, downloadBlob, generateFileName } from "@/utils/imageUtils";
import { Download, RefreshCcw, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ConversionOptionsProps {
  file: File | null;
  convertedBlob: Blob | null;
  selectedFormat: ConversionFormat;
  isConverting: boolean;
  onFormatChange: (format: ConversionFormat) => void;
  onConvert: () => void;
}

const ConversionOptions: React.FC<ConversionOptionsProps> = ({
  file,
  convertedBlob,
  selectedFormat,
  isConverting,
  onFormatChange,
  onConvert,
}) => {
  const handleDownload = async () => {
    if (!file || !convertedBlob) return;
    
    const fileName = generateFileName(file.name, selectedFormat);
    await downloadBlob(convertedBlob, fileName);
    
    toast.success("File downloaded successfully!");
    
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
          disabled={!file || isConverting}
          className="btn-gradient flex-1 py-6"
        >
          {isConverting ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : convertedBlob ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Converted to {selectedFormat.toUpperCase()}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Convert to {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>
        
        <Button
          onClick={handleDownload}
          disabled={!convertedBlob || isConverting}
          variant="outline"
          className="flex-1 py-6 border-2 hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default ConversionOptions;
