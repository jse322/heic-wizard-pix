import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ImagePreview from "@/components/ImagePreview";
import ConversionOptions from "@/components/ConversionOptions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ConversionFormat, convertMultipleHeicFiles } from "@/utils/imageUtils";
import { convertMultipleToHeic } from "@/utils/heicUtils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, FilesIcon } from "lucide-react";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedBlobs, setConvertedBlobs] = useState<{ blob: Blob, originalFile: File }[] | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ConversionFormat>("png");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionMode, setConversionMode] = useState<"fromHeic" | "toHeic">("fromHeic");

  const handleFilesAccepted = (newFiles: File[]) => {
    setFiles(prev => {
      // Create a Set to track unique files by name to prevent duplicates
      const uniqueFileNames = new Set(prev.map(f => f.name));
      
      // Filter out duplicates
      const uniqueNewFiles = newFiles.filter(file => {
        if (uniqueFileNames.has(file.name)) {
          return false;
        }
        uniqueFileNames.add(file.name);
        return true;
      });
      
      if (uniqueNewFiles.length < newFiles.length) {
        toast.info(`${newFiles.length - uniqueNewFiles.length} duplicate files were skipped.`);
      }
      
      return [...prev, ...uniqueNewFiles];
    });
    
    setConvertedBlobs(null);
  };

  const handleFormatChange = (format: ConversionFormat) => {
    setSelectedFormat(format);
    setConvertedBlobs(null);
  };

  const handleConvert = async () => {
    if (!files.length) return;

    setIsConverting(true);
    setConvertedBlobs(null);

    try {
      let converted;
      if (conversionMode === "fromHeic") {
        converted = await convertMultipleHeicFiles(files, selectedFormat);
      } else {
        converted = await convertMultipleToHeic(files);
      }
      setConvertedBlobs(converted);
      toast.success(`Successfully converted ${converted.length} ${converted.length === 1 ? 'file' : 'files'} to ${conversionMode === "fromHeic" ? selectedFormat.toUpperCase() : 'HEIC'}`);
    } catch (error) {
      console.error("Error during conversion:", error);
      toast.error("Failed to convert some files. Please try again or check the file formats.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setConvertedBlobs(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container max-w-4xl px-4 sm:px-6">
          <Header />

          <main className="space-y-8">
            <div className="flex justify-center gap-4 mb-8">
              <Button
                variant={conversionMode === "fromHeic" ? "default" : "outline"}
                onClick={() => {
                  setConversionMode("fromHeic");
                  setFiles([]);
                  setConvertedBlobs(null);
                }}
              >
                HEIC to PNG/JPG
              </Button>
              <Button
                variant={conversionMode === "toHeic" ? "default" : "outline"}
                onClick={() => {
                  setConversionMode("toHeic");
                  setFiles([]);
                  setConvertedBlobs(null);
                }}
              >
                PNG/JPG to HEIC
              </Button>
            </div>

            {files.length === 0 ? (
              <FileUpload onFilesAccepted={handleFilesAccepted} mode={conversionMode} />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium">Preview & Convert</h2>
                    <span className="bg-wizard-purple/10 text-wizard-purple text-xs px-2 py-1 rounded-full">
                      {files.length} {files.length === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        // Open file dialog to add more files
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.heic,.heif';
                        input.multiple = true;
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files && target.files.length > 0) {
                            handleFilesAccepted(Array.from(target.files));
                          }
                        };
                        input.click();
                      }}
                      className="text-muted-foreground"
                    >
                      <FilesIcon className="w-4 h-4 mr-2" />
                      Add More
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleReset}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
                
                <ImagePreview
                  files={files}
                  convertedBlobs={convertedBlobs}
                  isConverting={isConverting}
                />
                
                <ConversionOptions
                  files={files}
                  convertedBlobs={convertedBlobs}
                  selectedFormat={selectedFormat}
                  isConverting={isConverting}
                  onFormatChange={handleFormatChange}
                  onConvert={handleConvert}
                />
              </>
            )}

            <div className="mt-12 rounded-lg border bg-card p-6">
              <h3 className="text-lg font-medium mb-2">What is a HEIC file?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                HEIC is Apple's High-Efficiency Image Format that provides better compression 
                compared to JPEG while maintaining similar quality. However, many applications 
                and websites don't support HEIC files, which is why conversion to PNG or JPG is often needed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <h4 className="font-medium">When to use PNG:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                    <li>Need transparency</li>
                    <li>Used for graphics or screenshots</li>
                    <li>Want lossless quality</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">When to use JPG:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                    <li>Smaller file size is important</li>
                    <li>Used for photographs</li>
                    <li>Uploading to social media</li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
