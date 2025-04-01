// Component to render the Integrations & Scalability section

/**
 * Renders the Integrations & Scalability section for a tool.
 * @param {object} tool - The tool data object.
 * @returns {string} HTML string for the Integrations & Scalability section.
 */
export function renderIntegrationsSection(tool) {
  const { integration_capabilities, scalability } = tool;

  if ((!integration_capabilities || integration_capabilities.length === 0) && !scalability) {
    return ''; // Don't render if no data
  }

  const renderIntegrationList = (items) => {
    if (!items || items.length === 0) return '';
    return `
      <h4>Integration Capabilities</h4>
      <ul>
        ${items.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
  };

  const renderScalability = (text) => {
    if (!text) return '';
    return `
      <h4>Scalability</h4>
      <p>${text}</p>
    `;
  };

  return `
    <section class="tool-section integrations-section">
      <h2>Integrations & Scalability</h2>
      ${renderIntegrationList(integration_capabilities)}
      ${renderScalability(scalability)}
    </section>
  `;
}