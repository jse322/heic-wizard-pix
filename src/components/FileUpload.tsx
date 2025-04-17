
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, AlertCircle, FilesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAccepted }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        // Filter to only accept HEIC files
        const heicFiles = acceptedFiles.filter(file => 
          file.name.toLowerCase().endsWith('.heic') || 
          file.type.includes('heic')
        );
          
        if (heicFiles.length > 0) {
          onFilesAccepted(heicFiles);
          toast.success(`${heicFiles.length} HEIC ${heicFiles.length === 1 ? 'file' : 'files'} uploaded successfully!`);
          
          // Show warning if some files were filtered out
          if (heicFiles.length < acceptedFiles.length) {
            toast.warning(`${acceptedFiles.length - heicFiles.length} ${acceptedFiles.length - heicFiles.length === 1 ? 'file was' : 'files were'} skipped because they are not HEIC format.`);
          }
        } else {
          toast.error("Please upload HEIC files only");
        }
      }
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
    },
    multiple: true,
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
            <FilesIcon className="w-8 h-8 animate-bounce-subtle" />
          )}
        </div>
        <div className="text-center">
          <h3 className="font-medium text-lg mb-1">
            {dragActive ? "Drop your HEIC files here" : "Drag & drop multiple HEIC files here"}
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
