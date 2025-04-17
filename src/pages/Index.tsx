
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ImagePreview from "@/components/ImagePreview";
import ConversionOptions from "@/components/ConversionOptions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ConversionFormat, convertHeicToFormat } from "@/utils/imageUtils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ConversionFormat>("png");
  const [isConverting, setIsConverting] = useState(false);

  const handleFileAccepted = (file: File) => {
    setFile(file);
    setConvertedBlob(null);
  };

  const handleFormatChange = (format: ConversionFormat) => {
    setSelectedFormat(format);
    setConvertedBlob(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setConvertedBlob(null);

    try {
      const converted = await convertHeicToFormat(file, selectedFormat);
      setConvertedBlob(converted);
      toast.success(`Successfully converted to ${selectedFormat.toUpperCase()}`);
    } catch (error) {
      console.error("Error during conversion:", error);
      toast.error("Failed to convert file. Please try again or check the file format.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setConvertedBlob(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container max-w-4xl px-4 sm:px-6">
          <Header />

          <main className="space-y-8">
            {!file ? (
              <FileUpload onFileAccepted={handleFileAccepted} />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium">Preview & Convert</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
                
                <ImagePreview
                  file={file}
                  convertedBlob={convertedBlob}
                  isConverting={isConverting}
                />
                
                <ConversionOptions
                  file={file}
                  convertedBlob={convertedBlob}
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
