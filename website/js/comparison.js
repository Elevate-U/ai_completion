// Comparison page functionality (Refined)

// Import data loader
import { loadAllToolsData } from './utils/dataLoader.js'; // Import the centralized loader

// DOM Elements (Ensure these IDs exist in updated comparison.html)
const categoryFilter = document.getElementById('category-filter');
const toolSearch = document.getElementById('tool-search');
const toolList = document.getElementById('tool-list');
const comparisonPlaceholder = document.getElementById('comparison-placeholder');
const comparisonResults = document.getElementById('comparison-results');
const comparisonTable = document.getElementById('comparison-table'); // Target the <tbody> for content updates
const featuresChartCtx = document
  .getElementById('features-chart')
  ?.getContext('2d'); // Use optional chaining
const comparisonChart2Ctx = document
  .getElementById('pricing-chart')
  ?.getContext('2d'); // Renamed ID for clarity, use optional chaining
const toolSelectionCounterSpan = document.getElementById(
  'tool-selection-counter'
); // Added counter span

// State
let aiToolsData = []; // Store loaded data locally for this page
let selectedTools = []; // Store names or unique IDs of selected tools
let featuresChartInstance = null;
let comparisonChart2Instance = null;
const MAX_COMPARE_TOOLS = 8; // Increased limit

// Initialize comparison page
function initComparisonPage() {
  // Check if aiToolsData is loaded (it should be by the time this runs)
  if (!aiToolsData || aiToolsData.length === 0) {
    // Error handling might have already happened in the loader, but double-check
    if (
      comparisonPlaceholder &&
      !comparisonPlaceholder.textContent.includes('Error')
    ) {
      comparisonPlaceholder.innerHTML =
        '<p>Tool data is empty or failed to load.</p>';
      comparisonPlaceholder.style.display = 'block';
    }
    if (comparisonResults) comparisonResults.style.display = 'none';
    // Disable filters/search if no data
    if (categoryFilter) categoryFilter.disabled = true;
    if (toolSearch) toolSearch.disabled = true;
    return;
  }

  // Ensure chart contexts are available

  populateCategoryFilter();
  populateToolList(); // Initial population
  setupComparisonEventListeners();
  updateComparisonResults(); // Update based on initially selected tools (if any persisted)
  updateToolSelectionCounter(); // Initial counter update
}

// Populate category filter dropdown
function populateCategoryFilter() {
  if (!categoryFilter) return;
  const categories = [
    ...new Set(aiToolsData.map((tool) => tool.category)),
  ].sort();
  categoryFilter.innerHTML = `
        <option value="all">All Categories</option>
        ${categories.map((category) => `<option value="${category}">${category}</option>`).join('')}
    `;
}

// Populate tool list based on current filters
function populateToolList() {
  if (!toolList) return;

  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  const searchTerm = toolSearch ? toolSearch.value.toLowerCase() : '';

  let filteredTools = [...aiToolsData];

  // Filter by category
  if (selectedCategory !== 'all') {
    filteredTools = filteredTools.filter(
      (tool) => tool.category === selectedCategory
    );
  }

  // Filter by search term
  if (searchTerm) {
    filteredTools = filteredTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.category.toLowerCase().includes(searchTerm)
    );
  }

  // Sort tools alphabetically by name
  filteredTools.sort((a, b) => a.name.localeCompare(b.name));

  if (filteredTools.length === 0) {
    toolList.innerHTML =
      '<p class="text-muted p-2">No tools match filters.</p>';
    return;
  }

  toolList.innerHTML = filteredTools
    .map((tool) => {
      // Use a unique identifier if available, otherwise fallback to name
      const toolId = tool.id || tool.name;
      const isChecked = selectedTools.includes(toolId);
      const isDisabled =
        !isChecked && selectedTools.length >= MAX_COMPARE_TOOLS;

      return `
            <label class="list-group-item ${isDisabled ? 'disabled' : ''}">
                <input
                    class="form-check-input me-1"
                    type="checkbox"
                    value="${toolId}"
                    ${isChecked ? 'checked' : ''}
                    ${isDisabled ? 'disabled' : ''}
                    aria-label="Select ${tool.name} for comparison"
                >
                ${tool.name} <small class="text-muted">(${tool.category})</small>
            </label>
        `;
    })
    .join('');
}

// Update comparison results (table and charts)
function updateComparisonResults() {
  if (!comparisonPlaceholder || !comparisonResults) return;

  const toolsToCompare = aiToolsData.filter((tool) =>
    selectedTools.includes(tool.id || tool.name)
  );

  if (toolsToCompare.length < 2) {
    comparisonResults.style.display = 'none';
    comparisonPlaceholder.style.display = 'block';
    comparisonPlaceholder.innerHTML = `<p>Select 2 to ${MAX_COMPARE_TOOLS} tools from the sidebar to compare.</p>`; // Updated placeholder text
    // Destroy charts if they exist and less than 2 tools are selected
    if (featuresChartInstance) featuresChartInstance.destroy();
    if (comparisonChart2Instance) comparisonChart2Instance.destroy();
    featuresChartInstance = null;
    comparisonChart2Instance = null;
    return;
  }

  comparisonPlaceholder.style.display = 'none';
  comparisonResults.style.display = 'block';

  updateComparisonTable(toolsToCompare);
  if (featuresChartCtx && comparisonChart2Ctx) {
    // Only update charts if contexts exist
    updateCharts(toolsToCompare);
  }
}

// Update comparison table content
function updateComparisonTable(tools) {
  if (!comparisonTable) return;

  // Define the features/aspects to compare
  const comparisonAspects = [
    { label: 'Category', key: 'category' },
    { label: 'Description', key: 'description', truncate: 120 }, // Reduced truncation
    {
      label: 'Key Features (Top 5)', // Updated label
      key: 'features',
      format: (val) => {
        if (Array.isArray(val) && val.length > 0) {
          const escapeHtml = (unsafe) => {
            // Keep escaping
            if (typeof unsafe !== 'string') return unsafe;
            return unsafe
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
          };
          // Show only first 5 features
          const featuresToShow = val.slice(0, 5);
          let html = `<ul class="key-features-list compact-list">${featuresToShow.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`;
          if (val.length > 5) {
            html += `<small>(${val.length - 5} more...)</small>`; // Indicate more exist
          }
          return html;
        }
        return '-';
      },
    },
    { label: 'Primary Use Case', key: 'use_cases.0.title', fallback: 'N/A' }, // Added
    {
      label: 'Pricing Summary', // Changed label
      key: 'pricing.tiers', // Target the new tiers array
      format: (tiers) => {
        // Custom formatter
        if (!Array.isArray(tiers) || tiers.length === 0) return 'N/A';
        // Show first 1-2 paid tiers or indicate free/custom
        const freeTier = tiers.find(
          (t) =>
            t.tier_name?.toLowerCase().includes('free') ||
            t.price_description === '$0'
        );
        const paidTiers = tiers.filter(
          (t) =>
            t.price_description &&
            t.price_description !== '$0' &&
            !t.tier_name?.toLowerCase().includes('free')
        );
        const customTier = tiers.find(
          (t) => t.price_description?.toLowerCase() === 'custom'
        );

        let summary = '';
        if (freeTier) summary += 'Free Tier Available. ';
        if (paidTiers.length > 0) {
          summary += `Paid: ${paidTiers[0].price_description}${paidTiers[0].unit ? ` ${paidTiers[0].unit}` : ''}`;
          if (paidTiers.length > 1)
            summary += ` / ${paidTiers[1].price_description}${paidTiers[1].unit ? ` ${paidTiers[1].unit}` : ''}`;
          if (paidTiers.length > 2) summary += '...';
        } else if (customTier) {
          summary += 'Custom Pricing.';
        } else if (!freeTier) {
          summary = 'Check Website'; // If only free tier exists, this won't be hit
        }
        return summary.trim() || 'N/A';
      },
      fallback: 'N/A',
    },
    // Removed the old dedicated 'Free Tier' row as it's incorporated above
    {
      label: 'Pros (Top 3)', // Updated label
      key: 'pros',
      format: (val) => {
        // Updated format
        if (Array.isArray(val) && val.length > 0) {
          return `<ul class="compact-list">${val
            .slice(0, 3)
            .map((p) => `<li>${p}</li>`)
            .join('')}</ul>`;
        }
        return val || '-';
      },
    },
    {
      label: 'Cons (Top 3)', // Updated label
      key: 'cons',
      format: (val) => {
        // Updated format
        if (Array.isArray(val) && val.length > 0) {
          return `<ul class="compact-list">${val
            .slice(0, 3)
            .map((c) => `<li>${c}</li>`)
            .join('')}</ul>`;
        }
        return val || '-';
      },
    },
    {
      label: 'API Type',
      key: 'technical_specifications.api_type',
      fallback: 'N/A',
    },
    {
      label: 'SDKs', // Added
      key: 'technical_specifications.sdks',
      format: (val) =>
        Array.isArray(val)
          ? val.join(', ')
          : typeof val === 'string'
            ? val
            : '-', // Handle array or string
      fallback: 'N/A',
    },
    // Removed 'Scalability' row
    {
      label: 'Support Options (Top 3)', // Updated label
      key: 'support_options',
      format: (val) => {
        // Updated format
        if (Array.isArray(val) && val.length > 0) {
          return `<ul class="compact-list">${val
            .slice(0, 3)
            .map((s) => `<li>${s}</li>`)
            .join('')}</ul>`;
        }
        return val || '-';
      },
    },
    {
      label: 'Last Updated',
      key: 'last_updated',
      format: (val) => (val ? new Date(val).toLocaleDateString() : '-'),
      fallback: 'N/A',
    },
  ];

  // Create table header
  let tableHTML = `
        <thead class="table-dark">
            <tr>
                <th>Feature</th>
                ${tools.map((tool) => `<th>${tool.name}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
    `;

  // Add rows for each comparison aspect
  comparisonAspects.forEach((aspect) => {
    tableHTML += createComparisonRow(
      aspect.label,
      tools.map((tool) => getToolValue(tool, aspect.key, aspect.fallback)),
      aspect.format,
      aspect.truncate
    );
  });

  tableHTML += '</tbody>';
  comparisonTable.innerHTML = tableHTML;
}

// Helper to safely get nested property values
function getToolValue(tool, key, fallback = '-') {
  const keys = key.split('.');
  let value = tool;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback; // Key path doesn't exist or value is null/undefined
    }
  }
  return value !== null && value !== undefined ? value : fallback;
}

// Helper to create a comparison row with formatting and truncation
function createComparisonRow(label, values, formatFn, truncateLength) {
  return `
        <tr>
            <th>${label}</th>
            ${values
              .map((value) => {
                let displayValue = formatFn ? formatFn(value) : value || '-';
                if (
                  truncateLength &&
                  typeof displayValue === 'string' &&
                  displayValue.length > truncateLength
                ) {
                  displayValue =
                    displayValue.substring(0, truncateLength) + '...';
                }
                return `<td>${displayValue}</td>`;
              })
              .join('')}
        </tr>
    `;
}

// Update charts
function updateCharts(tools) {
  // Destroy existing charts before creating new ones
  if (featuresChartInstance) featuresChartInstance.destroy();
  if (comparisonChart2Instance) comparisonChart2Instance.destroy();

  // Chart 1: Feature Count Comparison (Bar Chart)
  featuresChartInstance = new Chart(featuresChartCtx, {
    type: 'bar',
    data: {
      labels: tools.map((tool) => tool.name),
      datasets: [
        {
          label: 'Number of Key Features',
          data: tools.map((tool) => (tool.features ? tool.features.length : 0)),
          backgroundColor: 'rgba(0, 122, 255, 0.6)', // Apple blue
          borderColor: 'rgba(0, 122, 255, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Feature Count Comparison',
          font: { size: 16 },
        },
        legend: { display: false },
      },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });

  // Chart 2: Qualitative Comparison (Radar Chart - Example)
  // Define aspects for the radar chart
  const radarAspects = [
    { label: 'Pricing Score', getValue: getPricingScore }, // Higher is better (cheaper/free)
    {
      label: 'Feature Richness',
      getValue: (tool) => (tool.features ? tool.features.length : 0),
    },
    { label: 'Scalability Score', getValue: getScalabilityScore }, // Higher is better
    {
      label: 'Support Score',
      getValue: (tool) =>
        tool.support_options ? tool.support_options.length * 2 : 0,
    }, // Simple score
  ];

  comparisonChart2Instance = new Chart(comparisonChart2Ctx, {
    type: 'radar',
    data: {
      labels: radarAspects.map((aspect) => aspect.label),
      datasets: tools.map((tool, index) => {
        const color = getChartColor(index);
        return {
          label: tool.name,
          data: radarAspects.map((aspect) =>
            Math.min(10, Math.max(0, aspect.getValue(tool)))
          ), // Get value, clamp between 0-10
          backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`,
          borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
          borderWidth: 1.5,
          pointBackgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
          pointRadius: 3,
        };
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Qualitative Comparison',
          font: { size: 16 },
        },
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12, // Smaller color box
            padding: 15, // Spacing between legend items
          },
          onClick: (e, legendItem, legend) => {
            // Make legend interactive
            const index = legendItem.datasetIndex;
            const ci = legend.chart;
            if (ci.isDatasetVisible(index)) {
              ci.hide(index);
              legendItem.hidden = true;
            } else {
              ci.show(index);
              legendItem.hidden = false;
            }
          },
        },
      },
      scales: {
        r: {
          angleLines: { display: true },
          suggestedMin: 0,
          suggestedMax: 10, // Scale from 0 to 10
          pointLabels: { font: { size: 10 } },
          ticks: { backdropPadding: 4, stepSize: 2 },
        },
      },
    },
  });
}

// Helper function for distinct chart colors
function getChartColor(index) {
  const colors = [
    { r: 0, g: 122, b: 255 }, // Apple Blue
    { r: 255, g: 149, b: 0 }, // Orange
    { r: 52, g: 199, b: 89 }, // Green
    { r: 255, g: 59, b: 48 }, // Red
  ];
  return colors[index % colors.length];
}

// Updated pricing score calculation (higher = better/cheaper)
function getPricingScore(tool) {
  const tiers = tool.pricing?.tiers;
  if (!Array.isArray(tiers) || tiers.length === 0) {
    // Check if it's explicitly free like NLTK/spaCy based on model description
    const modelDesc = tool.pricing?.model?.toLowerCase() || '';
    if (modelDesc.includes('free') || modelDesc.includes('open source'))
      return 10;
    return 3; // Default score if no pricing info
  }

  const hasFreeTier = tiers.some(
    (t) =>
      t.tier_name?.toLowerCase().includes('free') ||
      t.price_description === '$0'
  );
  if (hasFreeTier) return 10;

  // Find the lowest numerical monthly price for a rough score
  let minMonthlyPrice = Infinity;
  tiers.forEach((tier) => {
    if (tier.price_description && typeof tier.price_description === 'string') {
      const priceMatch = tier.price_description.match(
        /\$?(\d+(\.\d+)?)\s*\/(month|mo)/i
      );
      if (priceMatch && priceMatch[1]) {
        const price = parseFloat(priceMatch[1]);
        if (price > 0 && price < minMonthlyPrice) {
          minMonthlyPrice = price;
        }
      }
    }
  });

  if (minMonthlyPrice <= 10) return 9; // Very affordable tier
  if (minMonthlyPrice <= 30) return 7; // Affordable tier
  if (minMonthlyPrice <= 100) return 5; // Moderate tier
  if (minMonthlyPrice < Infinity) return 3; // Expensive tier

  // If no monthly price found, check for other indicators
  const hasPayGo = tiers.some(
    (t) =>
      t.unit?.includes('request') ||
      t.unit?.includes('token') ||
      t.unit?.includes('credits') ||
      t.unit?.includes('item')
  );
  if (hasPayGo) return 6; // Pay-as-you-go is generally good value

  const hasCustom = tiers.some(
    (t) => t.price_description?.toLowerCase() === 'custom'
  );
  if (hasCustom) return 2; // Custom usually implies enterprise/expensive

  return 4; // Default if only non-monthly paid tiers exist
}

// Simplified scalability score
function getScalabilityScore(tool) {
  const scalability = tool.scalability ? tool.scalability.toLowerCase() : '';
  if (scalability.includes('high') || scalability.includes('excellent'))
    return 10;
  if (scalability.includes('medium') || scalability.includes('good')) return 7;
  if (scalability.includes('low') || scalability.includes('limited')) return 3;
  return 5; // Default if unknown
}

// Update the selection counter display
function updateToolSelectionCounter() {
  if (toolSelectionCounterSpan) {
    toolSelectionCounterSpan.textContent = `(${selectedTools.length} / ${MAX_COMPARE_TOOLS})`;
  }
}

// Setup event listeners for comparison page
function setupComparisonEventListeners() {
  // Category filter change
  if (categoryFilter) {
    categoryFilter.addEventListener('change', populateToolList);
  }

  // Tool search input
  if (toolSearch) {
    toolSearch.addEventListener('input', populateToolList);
  }

  // Tool selection checkboxes
  if (toolList) {
    toolList.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const toolId = e.target.value;
        if (e.target.checked) {
          if (
            !selectedTools.includes(toolId) &&
            selectedTools.length < MAX_COMPARE_TOOLS
          ) {
            selectedTools.push(toolId);
          } else if (selectedTools.length >= MAX_COMPARE_TOOLS) {
            e.target.checked = false; // Prevent checking more than max
            // Optionally show a message to the user
            alert(`You can only compare up to ${MAX_COMPARE_TOOLS} tools.`); // Message reflects new limit
            return; // Stop further processing for this event
          }
        } else {
          selectedTools = selectedTools.filter((id) => id !== toolId);
        }
        updateComparisonResults();
        updateToolSelectionCounter(); // Update counter on change
        // Refresh tool list to update disabled states
        populateToolList();
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Use the centralized data loader to fetch data from the API
    aiToolsData = await loadAllToolsData(); // Assign to local variable
    // Now that data is loaded (or failed), initialize the page
    initComparisonPage();
  } catch (error) {
    // Display error on the page
    if (comparisonPlaceholder) {
      comparisonPlaceholder.innerHTML = `<p>Error loading tool data: ${error.message}. Please try refreshing.</p>`;
      comparisonPlaceholder.style.display = 'block';
    }
    if (comparisonResults) comparisonResults.style.display = 'none';
    // Initialize with empty data to prevent further errors
    aiToolsData = [];
    initComparisonPage(); // Still init to setup listeners etc., but with no data
  }
});

// Removed the old loadAllToolDataForComparison function as it's replaced by loadAllToolsData from dataLoader.js
