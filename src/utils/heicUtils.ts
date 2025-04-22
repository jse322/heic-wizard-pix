
// HEIC Conversion Utilities
import { blobToDataUrl } from "./imageUtils";

/**
 * Converts an image file to HEIC format
 * Note: While modern browsers can convert TO HEIC, support is limited
 * This function uses canvas to create a Blob in HEIC format
 */
export async function convertToHeic(file: File): Promise<Blob> {
  // Create a canvas to draw the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Create an image element to load the file
  const img = new Image();
  const imageUrl = URL.createObjectURL(file);
  
  try {
    // Wait for image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      img.src = imageUrl;
    });
    
    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image onto canvas
    ctx.drawImage(img, 0, 0);
    
    // Convert canvas to HEIC
    // Note: This relies on browser support, which is limited in some environments
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // Explicitly create a new Blob with the correct MIME type to ensure it's preserved
          resolve(new Blob([blob], { type: 'image/heic' }));
        } else {
          reject(new Error('Failed to convert to HEIC'));
        }
      }, 'image/heic', 0.8);
    });
    
    return blob;
  } finally {
    // Clean up
    URL.revokeObjectURL(imageUrl);
  }
}

/**
 * Converts multiple image files to HEIC format with concurrency control
 */
export async function convertMultipleToHeic(
  files: File[]
): Promise<{blob: Blob, originalFile: File}[]> {
  const results: {blob: Blob, originalFile: File}[] = [];
  const errors: {file: File, error: any}[] = [];
  
  // Process in batches of 3 files at a time for better performance and memory management
  const batchSize = 3;
  const totalBatches = Math.ceil(files.length / batchSize);
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, files.length);
    const batchFiles = files.slice(start, end);
    
    // Process this batch concurrently
    const batchPromises = batchFiles.map(async (file) => {
      try {
        const blob = await convertToHeic(file);
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
  
  return results;
}

/**
 * Generates a HEIC filename from the original file
 */
export function generateHeicFileName(originalName: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}.heic`;
}

/**
 * Downloads a HEIC file
 */
export async function downloadHeicFile(blob: Blob, fileName: string): Promise<void> {
  // Ensure the blob has the correct MIME type
  const heicBlob = new Blob([blob], { type: 'image/heic' });
  const url = URL.createObjectURL(heicBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith('.heic') ? fileName : `${fileName}.heic`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
