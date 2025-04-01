// Component to render the Pros and Cons section

/**
 * Renders the Pros and Cons section for a tool.
 * @param {object} tool - The tool data object.
 * @returns {string} HTML string for the Pros and Cons section.
 */
export function renderProsConsSection(tool) {
  const { pros, cons } = tool;

  if ((!pros || pros.length === 0) && (!cons || cons.length === 0)) {
    return ''; // Don't render the section if there's no data
  }

  const renderList = (items, className, title) => {
    if (!items || items.length === 0) return '';
    return `
      <div class="pros-cons-list ${className}">
        <h4>${title}</h4>
        <ul>
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  return `
    <section class="tool-section pros-cons-section">
      <h2>Pros &amp; Cons</h2>
      <div class="pros-cons-container">
        ${renderList(pros, 'pros-list', 'Pros')}
        ${renderList(cons, 'cons-list', 'Cons')}
      </div>
    </section>
  `;
}