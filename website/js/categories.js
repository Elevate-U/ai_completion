// Categories page functionality (Refined)
import { loadAllToolsData } from './utils/dataLoader.js';
import { renderToolCard } from './utils/cardRenderer.js'; // Import the shared renderer

// DOM Elements (Ensure these IDs exist in the updated categories.html)
const categorySidebarList = document.getElementById('category-sidebar-list');
const toolsContainer = document.getElementById('tools-container');
const categoryTitle = document.getElementById('category-title');
const categoryDescription = document.getElementById('category-description');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Module-level variable to store loaded tool data
let allToolsData = [];

// Function to render breadcrumbs for categories page
function renderCategoryBreadcrumbs(category) {
  const categoryName = category === 'all' ? 'All Categories' : category;
  return `
    <nav aria-label="breadcrumb" class="breadcrumbs-container">
      <ol class="breadcrumbs">
        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
        ${
          category === 'all'
            ? '<li class="breadcrumb-item active" aria-current="page">Categories</li>'
            : `<li class="breadcrumb-item"><a href="categories.html">Categories</a></li>
           <li class="breadcrumb-item active" aria-current="page">${categoryName}</li>`
        }
      </ol>
    </nav>
  `;
}

// Current state
let currentCategory = 'all'; // Default to 'all'
let currentSearchTerm = '';
// Initialize categories page with loaded data
function initCategoriesPage() { // Remove loadedData parameter
  // Accept loaded data
  console.log('Initializing Categories Page...');
  // Data is now passed directly, no need for global check here.
  // Error handling for loading is done before calling this function.
  const loadingIndicator = toolsContainer?.querySelector('.loading-indicator');

  // Use module-level allToolsData
  if (!allToolsData || allToolsData.length === 0) {
    console.error('initCategoriesPage called with invalid or empty data.');
    if (categorySidebarList)
      categorySidebarList.innerHTML = '<p class="error-message">Error: No category data loaded.</p>';
    if (toolsContainer) {
       // Display error within the main container, replacing loading indicator
       toolsContainer.innerHTML = '<p class="empty-state">Error: Could not display tools. No data received.</p>';
    }
    if (categoryTitle) categoryTitle.textContent = 'Error Loading Tools';
    if (categoryDescription)
      categoryDescription.textContent = 'Failed to load tool information.';
    return; // Stop initialization
  }

  // If data is valid, but elements are missing later, log it.
  // The loading indicator removal happens naturally when displayTools overwrites innerHTML.
  // Assign to a scope accessible by other functions if needed, or pass down
  // For now, let's pass it down.

  // Check for category in URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');
  // Use module-level allToolsData
  if (
    categoryFromUrl &&
    allToolsData.some((tool) => tool.category === categoryFromUrl)
  ) {
    currentCategory = categoryFromUrl;
    console.log(`Category from URL: ${currentCategory}`);
  } else {
    currentCategory = 'all'; // Default if no valid category in URL
  }

  displayCategorySidebar(); // Call without data
  displayTools(); // Call without data
  setupCategoriesEventListeners(); // Call without data
  console.log('Categories Page Initialized.');
  // console.log('aiToolsData:', loadedData); // Log the passed data
}

// Display all categories in sidebar
function displayCategorySidebar() { // Remove toolsData parameter
  // Accept data
  if (!categorySidebarList) {
    console.warn('Category sidebar list element not found.');
    return;
  }

  // Standardize category names to avoid duplicates
  const categoryMap = {
    'Natural Language Processing': 'NLP',
    'Natural Language Understanding': 'NLU',
    'Text Analysis': 'NLP',
    'Computer Vision': 'Computer Vision',
    'Machine Learning Platforms': 'Machine Learning Platforms',
    'Data Analytics & Business Intelligence':
      'Data Analytics & Business Intelligence',
    'Marketing & Sales Automation': 'Marketing & Sales Automation',
    'Content Creation & Design': 'Content Creation & Design',
    'Chatbots & Virtual Assistants': 'Chatbots & Virtual Assistants',
    'AI for Software Development': 'AI for Software Development',
    Cybersecurity: 'Cybersecurity',
    'Healthcare & Life Sciences': 'Healthcare & Life Sciences',
    'Financial & Risk Analysis': 'Financial & Risk Analysis',
    'Robotics & Automation': 'Robotics & Automation',
    'Education & Research': 'Education & Research',
    'Emerging & Niche AI Tools': 'Emerging & Niche AI Tools',
  };

  // Use module-level allToolsData
  const categoryCounts = allToolsData.reduce((counts, tool) => {
      if (tool.category) {
          counts[tool.category.trim()] = (counts[tool.category.trim()] || 0) + 1;
      }
      return counts;
  }, {});

  const categories = Object.keys(categoryCounts).sort();
  const totalTools = allToolsData.length;

  let sidebarHTML = `
        <a href="#" class="list-group-item ${currentCategory === 'all' ? 'active' : ''}" data-category="all">
            <span class="category-image-placeholder">
                <i class="fas fa-th-list"></i>
            </span>
            All Categories <span class="category-count">(${totalTools})</span>
        </a>
        ${categories
          .map(
            (category) => `
            <a href="#" class="list-group-item ${currentCategory === category ? 'active' : ''}" data-category="${category}">
                <span class="category-image-placeholder">
                    <i class="${getCategoryIconClass(category)}"></i>
                </span>
                ${categoryMap[category] || category} <span class="category-count">(${categoryCounts[category]})</span>
            </a>
        `
          )
          .join('')}
    `;
  categorySidebarList.innerHTML = sidebarHTML;
}

// Get Font Awesome icon class for each category
function getCategoryIconClass(category) {
  const iconMap = {
    'Natural Language Processing': 'fas fa-comment-dots',
    'Dialog Systems': 'fas fa-comments',
    'Cloud AI': 'fas fa-cloud',
    'Computer Vision': 'fas fa-eye',
    'Text Analysis': 'fas fa-file-alt',
    'Machine Learning': 'fas fa-brain',
    'Machine Learning Platforms': 'fas fa-server',
    'Data Analytics & Business Intelligence': 'fas fa-chart-bar',
    'Marketing & Sales Automation': 'fas fa-funnel-dollar',
    'Content Creation & Design': 'fas fa-palette',
    'Chatbots & Virtual Assistants': 'fas fa-robot',
    'AI for Software Development': 'fas fa-code',
    Cybersecurity: 'fas fa-shield-alt',
    'Healthcare & Life Sciences': 'fas fa-heartbeat',
    'Financial & Risk Analysis': 'fas fa-chart-line',
    'Robotics & Automation': 'fas fa-cogs',
    'Education & Research': 'fas fa-graduation-cap',
    'Emerging & Niche AI Tools': 'fas fa-lightbulb',
  };

  // Default to list icon if category not found
  return iconMap[category] || 'fas fa-th-list';
}

// Display tools based on current category and search term
function displayTools() { // Remove toolsData parameter
  // Accept data
  const mainContentContainer = document.querySelector('.tools-main-content'); // Get the main container
  const loadingIndicator = toolsContainer?.querySelector('.loading-indicator');
  if (loadingIndicator) {
      loadingIndicator.remove(); // Explicitly remove loading indicator if present
  }

  if (
    !mainContentContainer ||
    !toolsContainer ||
    !categoryTitle ||
    !categoryDescription
  ) {
    console.warn(
      'Required elements for displaying tools (container, title, description, tools) are missing.'
    );
    // Attempt to display an error message even if some elements are missing
    if (toolsContainer) {
        toolsContainer.innerHTML = '<p class="empty-state">Error: UI elements missing, cannot display tools.</p>';
    }
    return;
  }

  // --- Add Breadcrumbs ---
  const breadcrumbHtml = renderCategoryBreadcrumbs(currentCategory);
  // Remove existing breadcrumbs first to prevent duplication on updates
  const existingBreadcrumbs = mainContentContainer.querySelector(
    '.breadcrumbs-container'
  );
  if (existingBreadcrumbs) {
    existingBreadcrumbs.remove();
  }
  // Insert new breadcrumbs at the beginning of the main content area
  mainContentContainer.insertAdjacentHTML('afterbegin', breadcrumbHtml);
  // --- End Breadcrumbs ---
  // Removed erroneous closing brace here

  // Use module-level allToolsData
  let filteredTools = [...allToolsData];

  // Filter by category if selected (and not 'all')
  if (currentCategory && currentCategory !== 'all') {
    filteredTools = filteredTools.filter((tool) => {
      if (Array.isArray(tool.category)) {
        return tool.category.includes(currentCategory);
      } else if (typeof tool.category === 'string') {
        return tool.category === currentCategory; // Fallback for string category
      } else {
        console.error(
          `Invalid category type: ${typeof tool.category} for tool: ${tool.name}`
        );
        return false; // Skip this tool
      }
    });
  }

  // Filter by search term if present
  if (currentSearchTerm) {
    const searchTerm = currentSearchTerm.toLowerCase();
    filteredTools = filteredTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.category.toLowerCase().includes(searchTerm) ||
        (tool.description &&
          tool.description.toLowerCase().includes(searchTerm)) || // Search description
        (tool.features &&
          tool.features.some((feature) =>
            typeof feature === 'string'
              ? feature.toLowerCase().includes(searchTerm)
              : Object.values(feature)
                  .join(' ')
                  .toLowerCase()
                  .includes(searchTerm)
          )) // Search features
    );
  }

  // Update page title and description
  if (currentCategory && currentCategory !== 'all') {
    categoryTitle.textContent = currentCategory;
    categoryDescription.textContent = `Showing ${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''} in this category${currentSearchTerm ? ` matching "${currentSearchTerm}"` : ''}.`;
  } else {
    categoryTitle.textContent = 'All AI Tools';
    categoryDescription.textContent = `Showing ${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''}${currentSearchTerm ? ` matching "${currentSearchTerm}"` : ''}.`;
  }

  // Display the tools using the new card structure
  if (filteredTools.length > 0) {
    // Clear container first
    toolsContainer.innerHTML = '';
    // Use the shared renderToolCard function
    filteredTools.forEach(tool => {
        const toolCardElement = renderToolCard(tool);
        // Add click listener specifically for cards on this page if needed,
        // or rely on the button/link inside the card.
        // For simplicity, we'll rely on the button/link inside for now.
        toolsContainer.appendChild(toolCardElement);
    });
  } else {
    // Use the dedicated empty state class for styling
    toolsContainer.innerHTML = '<p class="empty-state">No tools found matching your criteria.</p>';
  }
}

// Setup event listeners for categories page
function setupCategoriesEventListeners() { // Remove toolsData parameter
  // Accept data (for consistency/future use)
  console.log('[categories.js] Setting up event listeners...'); // Log setup start
  console.log('[categories.js] toolsContainer element:', toolsContainer); // Log the element

  // Category sidebar click handlers
  if (categorySidebarList) {
    categorySidebarList.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryItem = e.target.closest('[data-category]');
      if (categoryItem && categoryItem.dataset.category !== currentCategory) {
        currentCategory = categoryItem.dataset.category;
        currentSearchTerm = ''; // Reset search when category changes
        if (searchInput) searchInput.value = ''; // Clear search input field
        displayTools(); // Call without data

        // Update active state in sidebar
        document
          .querySelectorAll('#category-sidebar-list a')
          .forEach((item) => {
            item.classList.remove('active');
          });
        categoryItem.classList.add('active');

        // Optional: Update URL without full reload
        const url = new URL(window.location);
        if (currentCategory === 'all') {
          url.searchParams.delete('category');
        } else {
          url.searchParams.set('category', currentCategory);
        }
        history.pushState({}, '', url); // Update URL bar
      }
    });
  } else {
    console.warn('Category sidebar list not found for event listener setup.');
  }

  // Search functionality (Moved inside this function)
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      currentSearchTerm = searchInput.value.trim();
      displayTools(); // Call without data
    });

    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        currentSearchTerm = searchInput.value.trim();
        displayTools(); // Call without data
      }
    });
  } else {
    console.warn('Search input or button not found for event listener setup.');
  }

  // Add listener for tool cards and "View Details" buttons
  if (toolsContainer) {
    // Added check for toolsContainer existence
    toolsContainer.addEventListener('click', (e) => {
      const toolCard = e.target.closest('.tool-card[data-tool-id]');
      const toolButton = e.target.closest('.btn[data-tool-id]');

      if (toolCard || toolButton) {
        e.preventDefault();
        const toolId = toolCard
          ? toolCard.dataset.toolId
          : toolButton.dataset.toolId;
        console.log(`Navigate to details for tool: ${toolId}`);
        window.location.href = `tool-details.html?id=${encodeURIComponent(toolId)}`;
      }
    });
  } else {
    console.warn('Tools container not found for event listener setup.');
  }
} // Correct closing brace for setupCategoriesEventListeners

// Initialize when DOM is loaded by fetching all tool data
document.addEventListener('DOMContentLoaded', async () => {
  // Make async
  console.log('[categories.js] DOMContentLoaded event fired.');

  try {
    console.log('[categories.js] Attempting to load all tool data...');
    // Assign loaded data to module-level variable
    allToolsData = await loadAllToolsData();
    console.log('[categories.js] All tool data loaded successfully.');
    initCategoriesPage(); // Initialize without passing data
  } catch (error) {
    console.error('[categories.js] Failed to load all tool data:', error);
    // Display error message using new structure/classes
    if (categorySidebarList)
      categorySidebarList.innerHTML =
        '<p class="error-message">Error loading categories. Please refresh.</p>';
    if (toolsContainer) {
        // Replace loading indicator with error message
        toolsContainer.innerHTML =
        '<p class="empty-state">Error loading tool data. Please refresh.</p>';
    }
    if (categoryTitle) categoryTitle.textContent = 'Error Loading Data';
    if (categoryDescription)
      categoryDescription.textContent =
        'Could not retrieve tool information. Please try again later.';
    // No need to call initCategoriesPage, error is displayed directly.
  }
});
