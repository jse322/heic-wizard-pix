
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ConversionFormat, downloadMultipleBlobs } from "@/utils/imageUtils";
import { 
  Download, 
  RefreshCcw, 
  CheckCircle, 
  Loader2, 
  Zap, 
  FileDown, 
  FileArchive, 
  FileText, 
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversionOptionsProps {
  files: File[];
  convertedBlobs: { blob: Blob, originalFile: File }[] | null;
  selectedFormat: ConversionFormat;
  isConverting: boolean;
  onFormatChange: (format: ConversionFormat) => void;
  onConvert: () => void;
}

type DownloadType = "individual" | "zip" | "pdf";

const ConversionOptions: React.FC<ConversionOptionsProps> = ({
  files,
  convertedBlobs,
  selectedFormat,
  isConverting,
  onFormatChange,
  onConvert,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownload = async (type: DownloadType) => {
    if (!files.length || !convertedBlobs?.length) return;
    
    setIsDownloading(true);
    
    try {
      await downloadMultipleBlobs(convertedBlobs, selectedFormat, type);
      
      let successMessage = "";
      switch (type) {
        case "zip":
          successMessage = "Files downloaded as ZIP successfully!";
          break;
        case "pdf":
          successMessage = "Files downloaded as PDF successfully!";
          break;
        default:
          successMessage = `${convertedBlobs.length} ${convertedBlobs.length === 1 ? 'file' : 'files'} downloaded successfully!`;
      }
      
      toast.success(successMessage);
      
      // Create confetti effect on download
      if (type !== "individual" || convertedBlobs.length === 1) {
        createConfetti();
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download files. Please try again.");
    } finally {
      setIsDownloading(false);
    }
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
            <Label htmlFor="jpeg" className="cursor-pointer">JPG (smaller file size, faster conversion)</Label>
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
              <Zap className="mr-2 h-4 w-4 animate-pulse" />
              Convert {files.length} {files.length === 1 ? 'file' : 'files'} to {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>
        
        {convertedBlobs?.length === 1 ? (
          <Button
            onClick={() => handleDownload("individual")}
            disabled={!convertedBlobs?.length || isConverting || isDownloading}
            variant="outline"
            className="flex-1 py-6 border-2 hover:bg-accent/10 hover:text-accent transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Download File
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={!convertedBlobs?.length || isConverting || isDownloading}
                variant="outline"
                className="flex-1 py-6 border-2 hover:bg-accent/10 hover:text-accent transition-colors"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download {convertedBlobs?.length || 0} Files
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem 
                onClick={() => handleDownload("individual")}
                disabled={isDownloading}
                className="cursor-pointer"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download Individually
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDownload("zip")}
                disabled={isDownloading}
                className="cursor-pointer"
              >
                <FileArchive className="mr-2 h-4 w-4" />
                Download as ZIP
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDownload("pdf")}
                disabled={isDownloading}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                Download as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {files.length > 1 && (
        <div className="p-3 bg-muted/30 rounded-md flex items-center border border-muted">
          <Loader2 className="w-4 h-4 mr-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {files.length > 3 ? 
              "Files will be processed in batches of 3 for optimal performance" : 
              "Converting multiple files may take longer depending on their size"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversionOptions;
