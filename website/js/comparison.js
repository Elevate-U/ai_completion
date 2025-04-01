// Comparison page functionality (Refined)

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

// State
let selectedTools = []; // Store names or unique IDs of selected tools
let featuresChartInstance = null;
let comparisonChart2Instance = null;
const MAX_COMPARE_TOOLS = 4;

// Initialize comparison page
function initComparisonPage() {
  console.log('Initializing Comparison Page...');
  // Check if aiToolsData is loaded
  if (typeof aiToolsData === 'undefined' || aiToolsData.length === 0) {
    console.error('AI Tools data not available for comparison page.');
    if (comparisonPlaceholder) {
      comparisonPlaceholder.innerHTML =
        '<p>Error loading tool data. Please try refreshing.</p>';
      comparisonPlaceholder.style.display = 'block';
    }
    if (comparisonResults) comparisonResults.style.display = 'none';
    // Disable filters/search if no data
    if (categoryFilter) categoryFilter.disabled = true;
    if (toolSearch) toolSearch.disabled = true;
    return;
  }

  // Ensure chart contexts are available
  if (!featuresChartCtx || !comparisonChart2Ctx) {
    console.warn(
      'One or both chart canvas contexts not found. Charts will be disabled.'
    );
  }

  populateCategoryFilter();
  populateToolList(); // Initial population
  setupComparisonEventListeners();
  updateComparisonResults(); // Update based on initially selected tools (if any persisted)
  console.log('Comparison Page Initialized.');
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
    comparisonPlaceholder.innerHTML = `<p>Select ${2 - toolsToCompare.length} more tool${toolsToCompare.length === 0 ? 's' : ''} to compare (up to ${MAX_COMPARE_TOOLS}).</p>`;
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
    { label: 'Description', key: 'description', truncate: 150 }, // Add description
    {
      label: 'Key Features',
      key: 'features',
      format: (val) => (val ? val.join(', ') : '-'),
    },
    { label: 'Pricing Model', key: 'pricing.model', fallback: 'N/A' }, // Access nested property safely
    {
      label: 'Free Tier',
      key: 'pricing.free_tier',
      format: (val) => (val ? 'Yes' : 'No'),
      fallback: 'N/A',
    },
    {
      label: 'Pros',
      key: 'pros',
      format: (val) => (val ? val.join(', ') : '-'),
    },
    {
      label: 'Cons',
      key: 'cons',
      format: (val) => (val ? val.join(', ') : '-'),
    },
    {
      label: 'API Type',
      key: 'technical_specifications.api_type',
      fallback: 'N/A',
    },
    { label: 'Scalability', key: 'scalability', fallback: 'N/A' },
    {
      label: 'Support Options',
      key: 'support_options',
      format: (val) => (val ? val.join(', ') : '-'),
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
        legend: { position: 'bottom' },
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

// Simplified pricing score calculation (higher = better/cheaper)
function getPricingScore(tool) {
  const pricing = tool.pricing;
  if (!pricing) return 3; // Default score if no pricing info
  if (typeof pricing === 'string') return 5; // Basic info

  const model = pricing.model ? pricing.model.toLowerCase() : '';
  const hasFreeTier = pricing.free_tier === true;

  if (hasFreeTier) return 10;
  if (model.includes('free')) return 10;
  if (model.includes('open source')) return 9;
  if (
    model.includes('low') ||
    model.includes('affordable') ||
    model.includes('pay-as-you-go')
  )
    return 7;
  if (model.includes('medium') || model.includes('moderate')) return 5;
  if (model.includes('high') || model.includes('enterprise')) return 2;
  return 4; // Default for other models
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
            alert(`You can only compare up to ${MAX_COMPARE_TOOLS} tools.`);
            return; // Stop further processing for this event
          }
        } else {
          selectedTools = selectedTools.filter((id) => id !== toolId);
        }
        updateComparisonResults();
        // Refresh tool list to update disabled states
        populateToolList();
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => { // Make listener async
  console.log('[comparison.js] DOMContentLoaded event fired.');

  // Load data specifically for this page
  // Assign the loaded data to a variable accessible by initComparisonPage
  // We'll redefine aiToolsData locally for this script's scope using window
  window.aiToolsData = await loadAllToolDataForComparison();

  // Now that data is loaded (or failed), initialize the page
  initComparisonPage();

});

// Function to fetch all tool data for the comparison page
async function loadAllToolDataForComparison() {
  console.log('[comparison.js] Attempting to load all tool data...');
  try {
    // 1. Fetch the list of tool filenames
    const listResponse = await fetch('/list-tool-files'); // Assumes local-dev-server.js endpoint is running
    if (!listResponse.ok) {
      throw new Error(`Failed to fetch tool list: ${listResponse.statusText}`);
    }
    const filenames = await listResponse.json();
    console.log(`[comparison.js] Fetched ${filenames.length} tool filenames.`);

    // 2. Fetch each tool's data file concurrently
    const fetchPromises = filenames.map(filename =>
      fetch(`/ai_tools_resource/data/${filename}`) // Construct path relative to server root
        .then(response => {
          if (!response.ok) {
            console.warn(`[comparison.js] Failed to fetch ${filename}: ${response.statusText}`);
            return null; // Return null for failed fetches
          }
          return response.json();
        })
        .catch(error => {
          console.warn(`[comparison.js] Error fetching ${filename}:`, error);
          return null; // Return null on network error
        })
    );

    const toolDataResults = await Promise.all(fetchPromises);

    // 3. Filter out null results (failed fetches) and assign to a local variable
    const loadedTools = toolDataResults.filter(data => data !== null);
    console.log(`[comparison.js] Successfully loaded data for ${loadedTools.length} tools.`);
    return loadedTools; // Return the loaded data

  } catch (error) {
    console.error('[comparison.js] Error loading tool data:', error);
    // Display error on the page
    if (comparisonPlaceholder) {
      comparisonPlaceholder.innerHTML = `<p>Error loading tool data: ${error.message}. Please try refreshing.</p>`;
      comparisonPlaceholder.style.display = 'block';
    }
    if (comparisonResults) comparisonResults.style.display = 'none';
    return []; // Return empty array on error
  }
}
