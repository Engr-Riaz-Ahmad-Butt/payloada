import { toast } from "sonner";

/**
 * Safely copies text to the system clipboard.
 * @param text The text to copy.
 * @param successMessage Optional message to show in the toast on success.
 */
export async function copyToClipboard(
  text: string,
  successMessage = "Copied to clipboard",
): Promise<void> {
  if (!text) {
    toast.error("Nothing to copy");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (error) {
    console.error("Failed to copy text: ", error);
    toast.error("Clipboard access is blocked in this browser");
  }
}
