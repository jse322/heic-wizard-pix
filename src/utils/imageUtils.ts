
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

    const blob = await heic2any({
      blob: file,
      toType: format === "jpeg" ? "image/jpeg" : "image/png",
      quality: 0.9,
    });

    return Array.isArray(blob) ? blob[0] : blob;
  } catch (error) {
    console.error("Error converting HEIC file:", error);
    throw error;
  }
}

// New function to handle multiple file conversions
export async function convertMultipleHeicFiles(
  files: File[],
  format: ConversionFormat
): Promise<{blob: Blob, originalFile: File}[]> {
  const results: {blob: Blob, originalFile: File}[] = [];
  
  // Process each file and collect results
  const conversions = files.map(async (file) => {
    try {
      const blob = await convertHeicToFormat(file, format);
      return { blob, originalFile: file };
    } catch (error) {
      console.error(`Error converting file ${file.name}:`, error);
      throw error;
    }
  });
  
  return Promise.all(conversions);
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
