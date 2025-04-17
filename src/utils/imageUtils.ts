
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

export function generateFileName(originalName: string, format: ConversionFormat): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}.${format === "jpeg" ? "jpg" : format}`;
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
