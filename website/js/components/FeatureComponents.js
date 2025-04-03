/**
 * Feature Components Module
 * Handles rendering of feature-related UI components
 */
import { escapeHtml } from '../utils/htmlUtils.js'; // Import shared escape function

/**
 * Renders a grid of feature cards with availability indicators
 * @param {Array|Object} features - Features data (array of objects or strings)
 * @returns {string} HTML string of the feature grid or error message
 */
export function renderFeatureList(features) {
  try {
    // Validate input
    if (!features) {
      return '<div class="no-features">No feature information available</div>';
    }

    // Normalize input to array if needed
    const featuresArray = Array.isArray(features) ? features : [features];

    if (featuresArray.length === 0) {
      return '<div class="no-features">No features to display</div>';
    }

    // Process each feature
    const featureCards = featuresArray.map((feature) => {
      const { name, description } = normalizeFeature(feature);
      const isAvailable = checkFeatureAvailability(feature);

      return `
                <div class="feature-card">
                    <h5>${escapeHtml(name)}</h5>
                    ${
                      description
                        ? `
                   <div class="feature-description">
                       ${escapeHtml(description)}
                   </div>`
                        : ''
                    }
                    <span class="${isAvailable ? 'available' : 'unavailable'}">
                        ${isAvailable ? '✓ Available' : '✗ Not available'}
                    </span>
                </div>
            `;
    });

    return `
            <div class="feature-grid">
                ${featureCards.join('')}
            </div>
        `;
  } catch (_error) {
    return '<div class="error">Error displaying features</div>';
  }
}

/**
 * Normalizes feature object structure
 * @param {Object|string} feature - Feature data
 * @returns {Object} Normalized feature {name, description}
 */
function normalizeFeature(feature) {
  if (typeof feature === 'string') {
    return {
      name: feature,
      description: '',
    };
  }

  return {
    name: feature.name || 'Unnamed Feature',
    description: feature.description || '',
  };
}

/**
 * Checks if a feature is available
 * @param {Object|string} feature - Feature data
 * @returns {boolean} Feature availability status
 */
function checkFeatureAvailability(feature) {
  // Strings are always considered available
  if (typeof feature === 'string') return true;

  // Objects are available unless explicitly marked false
  return feature.available !== false;
}

// Removed local escapeHtml function definition

/**
 * Renders a feature comparison table (stub implementation)
 * @param {Object} comparisonData - Comparison data
 * @returns {string} HTML string of comparison table
 */
export function renderFeatureComparison(comparisonData) {
  try {
    if (!comparisonData) {
      return '<div class="error">No comparison data provided</div>';
    }

    // Actual implementation would process comparisonData here
    return '<div class="feature-comparison">Feature comparison will be rendered here</div>';
  } catch (_error) {
    return '<div class="error">Error displaying feature comparison</div>';
  }
}
