
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileAccepted }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Check if the file is a HEIC file
        const isHeic = 
          file.name.toLowerCase().endsWith('.heic') || 
          file.type.includes('heic');
          
        if (isHeic) {
          onFileAccepted(file);
          toast.success("HEIC file uploaded successfully!");
        } else {
          toast.error("Please upload a HEIC file");
        }
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
    },
    maxFiles: 1,
  });

  React.useEffect(() => {
    setDragActive(isDragActive);
  }, [isDragActive]);

  return (
    <div
      {...getRootProps()}
      className={`drop-zone min-h-[200px] flex flex-col items-center justify-center p-6 cursor-pointer group animate-slide-up 
        ${dragActive ? "drop-zone-active" : "border-gray-300 hover:border-wizard-blue"}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div 
          className={`rounded-full p-4 transition-all duration-300 ${
            dragActive 
              ? "bg-wizard-purple text-white" 
              : "bg-wizard-soft-purple text-wizard-purple group-hover:bg-wizard-purple/20"
          }`}
        >
          {dragActive ? (
            <FileImage className="w-8 h-8 animate-pulse-glow" />
          ) : (
            <Upload className="w-8 h-8 animate-bounce-subtle" />
          )}
        </div>
        <div className="text-center">
          <h3 className="font-medium text-lg mb-1">
            {dragActive ? "Drop your HEIC file here" : "Drag & drop your HEIC file here"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>
          <div className="flex items-center justify-center text-xs text-muted-foreground gap-1.5">
            <AlertCircle className="w-3 h-3" />
            <span>Only HEIC images are supported</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
