/**
 * Attempts to extract a PDF's text layer as markdown.
 * Returns trimmed markdown on success, empty string when the PDF has no
 * extractable text (e.g. scanned / image-only PDFs).
 * Throws are caught and treated as "no text" by the caller.
 */
export async function pdfToMarkdown(buffer: Buffer): Promise<string> {
  try {
    const pdf2md = (await import('@opendocsg/pdf2md')).default;
    const markdown = await pdf2md(buffer);
    return markdown.trim();
  } catch {
    return '';
  }
}
