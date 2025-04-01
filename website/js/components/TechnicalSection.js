// Component to render the Technical Specifications & Compliance section

/**
 * Renders the Technical Specifications & Compliance section for a tool.
 * @param {object} tool - The tool data object.
 * @returns {string} HTML string for the Technical Specifications & Compliance section.
 */
export function renderTechnicalSection(tool) {
  const { technical_specifications, security_compliance, api_url, sdk_url } =
    tool;

  if (
    !technical_specifications &&
    !security_compliance &&
    !api_url &&
    !sdk_url
  ) {
    return ''; // Don't render if no relevant data
  }

  const renderSpecs = (specs) => {
    if (!specs) return '';
    let content = '<h4>Technical Specifications</h4>';
    content += '<ul class="details-list">'; // Use a class for potential styling
    if (specs.api_type)
      content += `<li><strong>API Type:</strong> ${specs.api_type}</li>`;
    if (specs.sdks) content += `<li><strong>SDKs:</strong> ${specs.sdks}</li>`; // Added SDKs
    if (specs.platforms)
      content += `<li><strong>Platforms:</strong> ${specs.platforms}</li>`; // Added Platforms
    if (specs.input_methods && specs.input_methods.length > 0) {
      content += `<li><strong>Input Methods:</strong> ${specs.input_methods.join(', ')}</li>`;
    }
    if (specs.supported_languages && specs.supported_languages.length > 0) {
      content += `<li><strong>Supported Languages:</strong> ${specs.supported_languages.join(', ')}</li>`;
    }
    // Render Performance Metrics if available
    if (
      specs.performance_metrics &&
      typeof specs.performance_metrics === 'object' &&
      Object.keys(specs.performance_metrics).length > 0
    ) {
      content += '<li><strong>Performance Metrics:</strong><ul>';
      // Iterate through keys (e.g., "Haiku", "Sonnet", "Opus")
      for (const [key, value] of Object.entries(specs.performance_metrics)) {
        if (value) {
          // Only render if value is not empty/null
          content += `<li><strong>${key}:</strong> ${value}</li>`;
        }
      }
      content += '</ul></li>';
    }
    content += '</ul>';
    return content;
  };

  const renderCompliance = (compliance) => {
    if (!compliance) return '';
    let content = '<h4>Security & Compliance</h4>';
    if (compliance.certifications && compliance.certifications.length > 0) {
      content += `<p><strong>Certifications:</strong> ${compliance.certifications.join(', ')}</p>`;
    }
    if (compliance.data_protection) {
      content += `<p><strong>Data Protection:</strong> ${compliance.data_protection}</p>`;
    }
    return content;
  };

  const renderLinks = () => {
    let content = '';
    if (api_url)
      content += `<p><strong>API Link:</strong> <a href="${api_url}" target="_blank" rel="noopener noreferrer">${api_url}</a></p>`;
    if (sdk_url)
      content += `<p><strong>SDK Link:</strong> <a href="${sdk_url}" target="_blank" rel="noopener noreferrer">${sdk_url}</a></p>`;
    return content;
  };

  return `
    <section class="tool-section technical-section">
      <h2>Technical Details</h2>
      ${renderSpecs(technical_specifications)}
      ${renderCompliance(security_compliance)}
      ${renderLinks()}
    </section>
  `;
}
