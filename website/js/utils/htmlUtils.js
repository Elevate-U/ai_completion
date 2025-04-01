/**
 * Basic HTML escaping for safety.
 * Also replaces common code block markers to avoid breaking <pre> tags.
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';

  // Basic replacement for common code block markers if they exist
  // This is a simple approach; more robust parsing might be needed for complex cases
  let cleaned = str.replace(/```[\s\S]*?```/g, '[Code Block]');

  // Escape HTML entities
  let escaped = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');

  return escaped;
}
