// Component to render the Resources & Support section

/**
 * Renders the Resources & Support section for a tool.
 * @param {object} tool - The tool data object.
 * @returns {string} HTML string for the Resources & Support section.
 */
export function renderResourcesSection(tool) {
  const {
    training_resources,
    support_options,
    documentation_url,
    data_source_urls,
  } = tool;

  if (
    (!training_resources || training_resources.length === 0) &&
    (!support_options || support_options.length === 0) &&
    !documentation_url &&
    (!data_source_urls || data_source_urls.length === 0)
  ) {
    return ''; // Don't render if no relevant data
  }

  const renderTrainingResources = (resources) => {
    if (!resources || resources.length === 0) return '';
    return `
      <h4>Training Resources</h4>
      <ul>
        ${resources
          .map(
            (resource) => `
          <li>
            <strong>${resource.type || 'Resource'}:</strong>
            <a href="${resource.url}" target="_blank" rel="noopener noreferrer">
              ${resource.description || resource.url}
            </a>
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  };

  const renderSupportOptions = (options) => {
    if (!options || options.length === 0) return '';
    return `
      <h4>Support Options</h4>
      <ul>
        ${options.map((option) => `<li>${option}</li>`).join('')}
      </ul>
    `;
  };

  const renderOtherLinks = () => {
    let content = '';
    if (documentation_url) {
      content += `
        <p>
          <strong>Documentation:</strong>
          <a href="${documentation_url}" target="_blank" rel="noopener noreferrer">${documentation_url}</a>
        </p>
      `;
    }
    if (data_source_urls && data_source_urls.length > 0) {
      content += `
        <p><strong>Data Sources:</strong></p>
        <ul>
            ${data_source_urls.map((url) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></li>`).join('')}
        </ul>
       `;
    }
    return content;
  };

  return `
    <section class="tool-section resources-section">
      <h2>Resources & Support</h2>
      ${renderTrainingResources(training_resources)}
      ${renderSupportOptions(support_options)}
      ${renderOtherLinks()}
    </section>
  `;
}
