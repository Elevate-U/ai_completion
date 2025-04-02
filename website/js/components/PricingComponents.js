// Helper function to render a value, handling objects/arrays safely
function renderValue(value) {
  if (value === null || typeof value === 'undefined') {
    return ''; // Return empty string for null/undefined
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    // Basic stringify for objects, might need refinement based on actual data
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return value.map(renderValue).join(', '); // Render array elements recursively
  }
  // Escape HTML to prevent XSS if value might contain user input or HTML tags
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

// Helper function to render metrics for a tier
function renderMetrics(metrics) {
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return '';
  }

  // Use a definition list for better structure
  const metricsHtml = metrics
    .map((metric) => {
      if (!metric || typeof metric !== 'object') return ''; // Skip invalid metrics

      // Construct the display value, including unit if present
      let displayValue = renderValue(metric.value);
      if (metric.unit) {
        displayValue += ` ${renderValue(metric.unit)}`;
      }
      // Add provider/architecture details if present (for things like HF endpoints)
      if (metric.provider) displayValue += ` (${metric.provider})`;
      if (metric.architecture) displayValue += ` ${metric.architecture}`;
      if (metric.gpus) displayValue += ` (${metric.gpus} GPU${metric.gpus > 1 ? 's' : ''})`;
      // Add other relevant metric fields as needed

      // Use metric_name as the term (dt) and the constructed value as the description (dd)
      return `<dt>${renderValue(metric.metric_name)}:</dt><dd>${displayValue}</dd>`;
    })
    .join('');

  return `<div class="tier-metrics"><dl>${metricsHtml}</dl></div>`;
}

// Helper function to render features for a tier
function renderFeatures(features) {
  if (!features || !Array.isArray(features) || features.length === 0) {
    return '';
  }
  const featuresHtml = features
    .map((feature) => `<li>${renderValue(feature)}</li>`)
    .join('');
  return `<ul class="tier-features">${featuresHtml}</ul>`;
}

// Main function to render pricing based on the new normalized structure
export function renderPricingTable(pricingData) {
  // pricingData is the whole pricing object from the API response
  if (
    !pricingData ||
    typeof pricingData !== 'object' ||
    !pricingData.tiers ||
    !Array.isArray(pricingData.tiers) ||
    pricingData.tiers.length === 0
  ) {
    // Check if there's at least a model description or notes to show
     if (pricingData?.model || pricingData?.notes || pricingData?.overall_notes) {
         // If only model/notes exist, PricingTab.js handles them. Return empty here.
         console.log('PricingComponents: No pricing tiers found, but model/notes might exist.');
         return '';
     } else {
        console.warn('PricingComponents: No valid pricing tiers or other pricing info found.');
        return '<p class="tab-no-data">No pricing information available.</p>';
     }
  }

  console.log(`PricingComponents: Rendering ${pricingData.tiers.length} pricing tiers.`);

  // Iterate through the tiers array from the new structure
  const tiersHtml = pricingData.tiers
    .map((tier) => {
      if (!tier || typeof tier !== 'object') {
        console.warn('PricingComponents: Skipping invalid tier object:', tier);
        return ''; // Skip invalid tier data
      }

      // Construct the tier card HTML
      return `
        <div class="tab-section pricing-tier-card">
          <h3 class="tab-subheader">${renderValue(tier.tier_name)}</h3>
          ${tier.price_description ? `<p class="tier-price"><strong>Price:</strong> ${renderValue(tier.price_description)}${tier.unit ? ` ${renderValue(tier.unit)}` : ''}</p>` : ''}
          ${tier.tier_description ? `<p class="tier-description">${renderValue(tier.tier_description)}</p>` : ''}
          ${renderFeatures(tier.features)}
          ${renderMetrics(tier.metrics)}
        </div>
      `;
    })
    .join('');

  return tiersHtml; // Return the combined HTML for all tiers
}
