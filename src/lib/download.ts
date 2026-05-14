import { toast } from "sonner";

/**
 * Downloads a string content as a file.
 * @param content The string content to download.
 * @param filename The name of the file (e.g., "export.json").
 * @param contentType The MIME type of the file (e.g., "application/json").
 */
export function downloadFile(content: string, filename: string, contentType: string): void {
  if (!content) {
    toast.error("There is no output to download yet");
    return;
  }

  try {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  } catch (error) {
    console.error("Failed to download file: ", error);
    toast.error("Failed to download file");
  }
}
