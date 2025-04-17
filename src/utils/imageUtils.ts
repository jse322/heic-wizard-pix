
import heic2any from "heic2any";

export type ConversionFormat = "png" | "jpeg";

export async function convertHeicToFormat(
  file: File,
  format: ConversionFormat
): Promise<Blob> {
  try {
    // Check if file is a HEIC file
    if (!file.type.includes("heic") && !file.name.toLowerCase().endsWith(".heic")) {
      throw new Error("File is not a HEIC image");
    }

    // Optimize conversion with better quality-to-performance ratio
    const blob = await heic2any({
      blob: file,
      toType: format === "jpeg" ? "image/jpeg" : "image/png",
      quality: format === "jpeg" ? 0.85 : 0.9, // Lower quality for JPEG for faster conversion
    });

    return Array.isArray(blob) ? blob[0] : blob;
  } catch (error) {
    console.error("Error converting HEIC file:", error);
    throw error;
  }
}

// Optimized function to handle multiple file conversions with concurrency control
export async function convertMultipleHeicFiles(
  files: File[],
  format: ConversionFormat
): Promise<{blob: Blob, originalFile: File}[]> {
  const results: {blob: Blob, originalFile: File}[] = [];
  const errors: {file: File, error: any}[] = [];
  
  // Use Promise.all with a concurrency limit for better performance
  // Process in batches of 3 files at a time to avoid memory issues
  const batchSize = 3;
  const totalBatches = Math.ceil(files.length / batchSize);
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, files.length);
    const batchFiles = files.slice(start, end);
    
    // Process this batch concurrently
    const batchPromises = batchFiles.map(async (file) => {
      try {
        const blob = await convertHeicToFormat(file, format);
        return { blob, originalFile: file, success: true };
      } catch (error) {
        console.error(`Error converting file ${file.name}:`, error);
        return { originalFile: file, error, success: false };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    // Separate successful conversions and errors
    batchResults.forEach(result => {
      if (result.success && 'blob' in result) {
        results.push({
          blob: result.blob,
          originalFile: result.originalFile
        });
      } else if (!result.success) {
        errors.push({
          file: result.originalFile,
          error: result.error
        });
      }
    });
  }
  
  // If all conversions failed, throw an error
  if (results.length === 0 && errors.length > 0) {
    throw new Error("All conversions failed");
  }
  
  // Return successful conversions
  return results;
}

export function generateFileName(originalName: string, format: ConversionFormat): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}.${format === "jpeg" ? "jpg" : format}`;
}

// New function to batch download multiple files
export async function downloadMultipleBlobs(
  blobFileData: {blob: Blob, originalFile: File}[],
  format: ConversionFormat
): Promise<void> {
  if (blobFileData.length === 1) {
    // Single file download
    const { blob, originalFile } = blobFileData[0];
    const fileName = generateFileName(originalFile.name, format);
    await downloadBlob(blob, fileName);
    return;
  }
  
  // Create a zip file if there are multiple files
  // For now, download them sequentially
  for (const { blob, originalFile } of blobFileData) {
    const fileName = generateFileName(originalFile.name, format);
    await downloadBlob(blob, fileName);
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function downloadBlob(blob: Blob, fileName: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
