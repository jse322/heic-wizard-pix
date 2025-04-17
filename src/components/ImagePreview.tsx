
import React, { useState, useEffect } from "react";
import { blobToDataUrl } from "@/utils/imageUtils";
import { Loader2, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ConversionItem {
  file: File;
  convertedBlob: Blob | null;
  previewUrl: string | null;
}

interface ImagePreviewProps {
  files: File[];
  convertedBlobs: { blob: Blob, originalFile: File }[] | null;
  isConverting: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  files,
  convertedBlobs,
  isConverting,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewItems, setPreviewItems] = useState<ConversionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Setup preview items when files change
  useEffect(() => {
    if (files.length > 0) {
      setLoading(true);
      
      // Create preview items for all files
      const items = files.map(file => ({
        file,
        convertedBlob: null,
        previewUrl: URL.createObjectURL(file)
      }));
      
      setPreviewItems(items);
      
      // Reset active index if out of bounds
      if (activeIndex >= files.length) {
        setActiveIndex(0);
      }
    } else {
      setPreviewItems([]);
    }
  }, [files]);

  // Update preview items when blobs are available
  useEffect(() => {
    if (convertedBlobs && convertedBlobs.length > 0) {
      setLoading(true);
      
      // Create preview URLs for converted blobs
      const loadPreviewUrls = async () => {
        const updatedItems = [...previewItems];
        
        for (const { blob, originalFile } of convertedBlobs) {
          const index = previewItems.findIndex(item => item.file === originalFile);
          if (index !== -1) {
            const dataUrl = await blobToDataUrl(blob);
            updatedItems[index] = {
              ...updatedItems[index],
              convertedBlob: blob,
              previewUrl: dataUrl
            };
          }
        }
        
        setPreviewItems(updatedItems);
        setLoading(false);
      };
      
      loadPreviewUrls();
    }
  }, [convertedBlobs]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % files.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + files.length) % files.length);
  };

  if (files.length === 0) {
    return null;
  }

  const activeFile = files[activeIndex];
  const hasMultipleFiles = files.length > 1;

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Preview header with count */}
      {hasMultipleFiles && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            Image {activeIndex + 1} of {files.length}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrev}
              disabled={files.length <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNext}
              disabled={files.length <= 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Preview grid */}
      <div className="grid md:grid-cols-2 gap-6 animate-scale-in">
        {/* Original File */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Original HEIC</h3>
          <div className="border rounded-lg overflow-hidden aspect-video flex items-center justify-center bg-gray-50 relative">
            {activeFile ? (
              <>
                {/* Attempt to display the HEIC, but show a fallback if it fails */}
                <img
                  src={previewItems[activeIndex]?.previewUrl || ''}
                  alt="Original HEIC file (preview may not be supported)"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                  <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">HEIC Preview Not Available</span>
                </div>
              </>
            ) : (
              <Skeleton className="w-full h-full absolute inset-0" />
            )}
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
              {activeFile?.name || 'No file'}
            </div>
          </div>
        </div>

        {/* Converted Preview */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Converted Image</h3>
          <div className="border rounded-lg overflow-hidden aspect-video flex items-center justify-center bg-gray-50 relative">
            {isConverting ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-wizard-purple animate-spin" />
                <span className="text-sm text-muted-foreground">Converting...</span>
              </div>
            ) : previewItems[activeIndex]?.convertedBlob ? (
              <>
                <img
                  src={previewItems[activeIndex]?.previewUrl || ''}
                  alt="Converted image"
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                  Conversion Complete
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-12 h-12 text-gray-300" />
                <span className="text-sm text-gray-400">Select format to convert</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnails for multiple images */}
      {hasMultipleFiles && (
        <div className="overflow-x-auto py-2">
          <div className="flex gap-2 min-w-max">
            {files.map((file, index) => (
              <div 
                key={file.name + index} 
                className={`cursor-pointer border-2 ${index === activeIndex ? 'border-wizard-purple' : 'border-transparent'} rounded-md overflow-hidden`}
                onClick={() => setActiveIndex(index)}
              >
                <div className="w-16 h-16 bg-muted flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
