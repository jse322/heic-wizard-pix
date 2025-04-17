
import React, { useState, useEffect } from "react";
import { blobToDataUrl } from "@/utils/imageUtils";
import { Loader2, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImagePreviewProps {
  file: File | null;
  convertedBlob: Blob | null;
  isConverting: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  convertedBlob,
  isConverting,
}) => {
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [convertedPreview, setConvertedPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load converted preview when available
  useEffect(() => {
    if (convertedBlob) {
      setLoading(true);
      blobToDataUrl(convertedBlob)
        .then((dataUrl) => {
          setConvertedPreview(dataUrl);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error creating preview for converted image:", error);
          setLoading(false);
        });
    } else {
      setConvertedPreview(null);
    }
  }, [convertedBlob]);

  // Attempt to display HEIC as original preview - browsers may not support this natively
  useEffect(() => {
    if (file) {
      setLoading(true);
      // Try to create a preview URL for the HEIC file
      // Note: This might not work directly in most browsers, but we try anyway
      const previewUrl = URL.createObjectURL(file);
      setOriginalPreview(previewUrl);
      
      // Clean up the URL when component unmounts
      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    } else {
      setOriginalPreview(null);
    }
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-scale-in">
      {/* Original File */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Original HEIC</h3>
        <div className="border rounded-lg overflow-hidden aspect-video flex items-center justify-center bg-gray-50 relative">
          {originalPreview ? (
            <>
              {/* We attempt to display the HEIC, but show a fallback if it fails */}
              <img
                src={originalPreview}
                alt="Original HEIC file (preview may not be supported)"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  setLoading(false);
                }}
                onLoad={() => setLoading(false)}
              />
              <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gray-50 ${loading ? "block" : "hidden"}`}>
                <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                <span className="text-sm text-gray-400">HEIC Preview Not Available</span>
              </div>
            </>
          ) : (
            <Skeleton className="w-full h-full absolute inset-0" />
          )}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
            {file.name}
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
          ) : convertedPreview ? (
            <>
              <img
                src={convertedPreview}
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
  );
};

export default ImagePreview;
