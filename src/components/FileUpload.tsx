
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FilesIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  mode?: "toHeic" | "fromHeic";
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAccepted, mode = "fromHeic" }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        if (mode === "fromHeic") {
          // Filter to only accept HEIC files
          const heicFiles = acceptedFiles.filter(file => 
            file.name.toLowerCase().endsWith('.heic') || 
            file.type.includes('heic')
          );
            
          if (heicFiles.length > 0) {
            onFilesAccepted(heicFiles);
            toast.success(`${heicFiles.length} HEIC ${heicFiles.length === 1 ? 'file' : 'files'} uploaded successfully!`);
            
            if (heicFiles.length < acceptedFiles.length) {
              toast.warning(`${acceptedFiles.length - heicFiles.length} ${acceptedFiles.length - heicFiles.length === 1 ? 'file was' : 'files were'} skipped because they are not HEIC format.`);
            }
          } else {
            toast.error("Please upload HEIC files only");
          }
        } else {
          // Filter to only accept PNG/JPG files
          const imageFiles = acceptedFiles.filter(file => 
            file.type.includes('png') || 
            file.type.includes('jpeg') || 
            file.name.toLowerCase().match(/\.(png|jpe?g)$/)
          );
            
          if (imageFiles.length > 0) {
            onFilesAccepted(imageFiles);
            toast.success(`${imageFiles.length} ${imageFiles.length === 1 ? 'file' : 'files'} uploaded successfully!`);
            
            if (imageFiles.length < acceptedFiles.length) {
              toast.warning(`${acceptedFiles.length - imageFiles.length} ${acceptedFiles.length - imageFiles.length === 1 ? 'file was' : 'files were'} skipped because they are not PNG/JPG format.`);
            }
          } else {
            toast.error("Please upload PNG or JPG files only");
          }
        }
      }
    },
    [onFilesAccepted, mode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mode === "fromHeic" 
      ? {
          'image/heic': ['.heic'],
          'image/heif': ['.heif'],
        }
      : {
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
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
        ${dragActive 
          ? "border-gray-500 bg-gray-100 dark:border-gray-600 dark:bg-gray-800" 
          : "border-gray-300 hover:border-gray-500 dark:border-gray-700 dark:hover:border-gray-500"
        } border-2 border-dashed rounded-xl`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div 
          className={`rounded-full p-4 transition-all duration-300 ${
            dragActive 
              ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300" 
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
          }`}
        >
          <FilesIcon className={`w-8 h-8 ${dragActive ? 'animate-pulse-glow' : 'animate-bounce-subtle'}`} />
        </div>
        <div className="text-center">
          <h3 className="font-medium text-lg mb-1 text-gray-800 dark:text-gray-200">
            {dragActive 
              ? `Drop your ${mode === "fromHeic" ? "HEIC" : "PNG/JPG"} files here` 
              : `Drag & drop multiple ${mode === "fromHeic" ? "HEIC" : "PNG/JPG"} files here`}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            or click to browse files
          </p>
          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-500 gap-1.5">
            <AlertCircle className="w-3 h-3" />
            <span>Only {mode === "fromHeic" ? "HEIC" : "PNG/JPG"} images are supported</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

