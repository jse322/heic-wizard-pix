import heic2any from "heic2any";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

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

// Function to download a single file
export async function downloadSingleFile(
  blobData: {blob: Blob, originalFile: File},
  format: ConversionFormat
): Promise<void> {
  const { blob, originalFile } = blobData;
  const fileName = generateFileName(originalFile.name, format);
  await downloadBlob(blob, fileName);
}

// Function to download multiple files as ZIP
export async function downloadAsZip(
  blobFileData: {blob: Blob, originalFile: File}[],
  format: ConversionFormat
): Promise<void> {
  const zip = new JSZip();
  
  // Add each blob to the zip file
  blobFileData.forEach(({ blob, originalFile }) => {
    const fileName = generateFileName(originalFile.name, format);
    zip.file(fileName, blob);
  });
  
  // Generate the zip file and download it
  const zipBlob = await zip.generateAsync({ type: "blob" });
  await downloadBlob(zipBlob, `converted_images_${Date.now()}.zip`);
}

// Function to create and download a PDF with all images
export async function downloadAsPdf(
  blobFileData: {blob: Blob, originalFile: File}[],
  format: ConversionFormat
): Promise<void> {
  // Create a new PDF document
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10; // 10mm margin
  const maxWidth = pageWidth - (margin * 2);
  const maxHeight = pageHeight - (margin * 2);
  
  let isFirstPage = true;
  
  // Process each image and add it to the PDF
  for (let i = 0; i < blobFileData.length; i++) {
    const { blob } = blobFileData[i];
    
    // Convert blob to data URL
    const dataUrl = await blobToDataUrl(blob);
    
    // Create a temporary image to get dimensions
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = dataUrl;
    });
    
    // Calculate image dimensions to fit within page while maintaining aspect ratio
    let imgWidth = img.width;
    let imgHeight = img.height;
    
    if (imgWidth > maxWidth) {
      const ratio = maxWidth / imgWidth;
      imgWidth = maxWidth;
      imgHeight = imgHeight * ratio;
    }
    
    if (imgHeight > maxHeight) {
      const ratio = maxHeight / imgHeight;
      imgHeight = maxHeight;
      imgWidth = imgWidth * ratio;
    }
    
    // Add a new page for each image except the first one
    if (!isFirstPage) {
      pdf.addPage();
    } else {
      isFirstPage = false;
    }
    
    // Add image to PDF, centered on the page
    const x = margin + (maxWidth - imgWidth) / 2;
    const y = margin + (maxHeight - imgHeight) / 2;
    pdf.addImage(dataUrl, format === "jpeg" ? "JPEG" : "PNG", x, y, imgWidth, imgHeight);
  }
  
  // Save and download the PDF
  pdf.save(`converted_images_${Date.now()}.pdf`);
}

// New function to batch download multiple files with different options
export async function downloadMultipleBlobs(
  blobFileData: {blob: Blob, originalFile: File}[],
  format: ConversionFormat,
  downloadType: "individual" | "zip" | "pdf" = "individual"
): Promise<void> {
  if (!blobFileData.length) return;
  
  switch (downloadType) {
    case "zip":
      await downloadAsZip(blobFileData, format);
      break;
    case "pdf":
      await downloadAsPdf(blobFileData, format);
      break;
    case "individual":
    default:
      if (blobFileData.length === 1) {
        // Single file download
        await downloadSingleFile(blobFileData[0], format);
      } else {
        // Multiple individual downloads
        for (const fileData of blobFileData) {
          await downloadSingleFile(fileData, format);
        }
      }
      break;
  }
}

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
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image onto canvas
    ctx.drawImage(img, 0, 0);
    
    // Convert canvas to HEIC
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new Blob([blob], { type: 'image/heic' }));
        } else {
          reject(new Error('Failed to convert to HEIC'));
        }
      }, 'image/heic');
    });
    
    return blob;
  } finally {
    // Clean up
    URL.revokeObjectURL(imageUrl);
  }
}

export async function convertMultipleToHeic(
  files: File[]
): Promise<{blob: Blob, originalFile: File}[]> {
  const results: {blob: Blob, originalFile: File}[] = [];
  const errors: {file: File, error: any}[] = [];
  
  // Process in batches of 3 files at a time
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
