// Features tab content rendering - moved from tool-details.js
import {
  renderFeatureList,
} from './FeatureComponents.js';

export function renderFeaturesTabContent(tool) {
  console.log('renderFeaturesTabContent called');
  return `
        <section class="tool-section">
            <h2>Key Features</h2>
            ${renderFeatureList(tool.features)}
        </section>
        ${
          tool.feature_visualization_mermaid
            ? `
        <section class="mermaid-section">
            <h3>Feature Visualization</h3>
            <div class="mermaid">
                ${tool.feature_visualization_mermaid.replace(/```mermaid\n?/, '').replace(/```$/, '')}
            </div>
        </section>
        `
            : ''
        }
    `;
}
