export function sanitizeHtmlString(htmlString: string) {
  return htmlString
    // Remove whitespace between elements (no whitespace only nodes)
    .replace(/>\s+</g, '><')
    // remove lit-html expression markers
    .replace(/<!---->/g, '')
    // Remove leading and trailing whitespace
    .trim();
}