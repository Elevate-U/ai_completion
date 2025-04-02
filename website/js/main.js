// main.js modifications

// Import necessary function from dataLoader
import { loadAllToolsData } from './utils/dataLoader.js';
import { renderToolCard } from './utils/cardRenderer.js'; // Import the new function

// --- Global Variables ---
let allToolsData = []; // To store the originally fetched tool data
let currentFilters = { // To keep track of active filters
    searchTerm: '',
    categories: new Set(),
    pricing: 'all',
    features: new Set()
};
let currentSort = 'default'; // To keep track of the current sort order

// --- DOM Element References (get them once) ---
const toolsListContainer = document.getElementById('tools-list');
const searchInput = document.getElementById('tool-search-input');
const categoryFiltersContainer = document.getElementById('category-filters-container');
const pricingFiltersContainer = document.getElementById('pricing-filters-container');
const featureFiltersContainer = document.getElementById('feature-filters-container');
const sortSelect = document.getElementById('sort-select');

// Parallax effect for hero section (Keep as is)
window.addEventListener('scroll', function () {
  const hero = document.querySelector('.hero-section');
  if (hero) {
    const scrollPosition = window.pageYOffset;
    const heroImage = hero.querySelector('.hero-image');
    if (heroImage) {
      // Adjust parallax effect if needed, or keep as is
      heroImage.style.transform = `translateY(${scrollPosition * 0.3}px) translateZ(-1px) scale(2)`;
    }
  }
});
// Helper function to calculate the initial theme
function calculateInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

  if (savedTheme) {
    return savedTheme; // Use saved theme if available
  }

  if (systemPrefersDark) {
    return 'dark'; // Use system preference if no saved theme
  }

  return 'spotify'; // Default to Spotify theme
}

// Helper function to update the theme attribute on the HTML element
function updateThemeAttribute(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// --- Filter Population ---
function populateFilters(tools) {
    if (!categoryFiltersContainer || !featureFiltersContainer) {
        console.warn('Filter containers not found, skipping filter population.');
        return;
    }

    const categories = new Set();
    const features = new Set();

    tools.forEach(tool => {
        if (tool.category) {
            categories.add(tool.category.trim());
        }
        // Assuming features are in an array tool.features = ["Feature A", "Feature B"]
        if (Array.isArray(tool.features)) {
            tool.features.forEach(feature => features.add(feature.trim()));
        }
        // Also check for common_features structure if that exists
        if (tool.common_features && typeof tool.common_features === 'object') {
             Object.keys(tool.common_features).forEach(feature => features.add(feature.trim()));
        }
    });

    // Populate Categories
    categoryFiltersContainer.innerHTML = ''; // Clear loading/previous
    const sortedCategories = Array.from(categories).sort();
    sortedCategories.forEach(category => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category;
        checkbox.dataset.filterType = 'category'; // Add data attribute for delegation
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${category}`));
        categoryFiltersContainer.appendChild(label);
    });
    if (sortedCategories.length === 0) {
        categoryFiltersContainer.innerHTML = '<p>No categories found.</p>';
    }


    // Populate Features
    featureFiltersContainer.innerHTML = ''; // Clear loading/previous
    const sortedFeatures = Array.from(features).sort();
     sortedFeatures.forEach(feature => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = feature;
        checkbox.dataset.filterType = 'feature'; // Add data attribute for delegation
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${feature}`));
        featureFiltersContainer.appendChild(label);
    });
     if (sortedFeatures.length === 0) {
        featureFiltersContainer.innerHTML = '<p>No features found.</p>';
    }
}


// --- Display Tools Function (Minor update for clarity) ---
function displayTools(toolsData) {
    if (!toolsListContainer) {
        console.error('Tool list container (#tools-list) not found.');
        return;
    }

    // Clear previous content or loading state
    toolsListContainer.innerHTML = '';

    if (!toolsData || toolsData.length === 0) {
        toolsListContainer.innerHTML = '<p class="empty-state">No tools match your criteria.</p>';
        return;
    }

    toolsData.forEach(tool => {
        // Use the shared renderer to create the card
        const toolCardElement = renderToolCard(tool);
        toolsListContainer.appendChild(toolCardElement);
    });
}

// --- Filtering and Sorting Logic ---
function applyFiltersAndSort() {
    console.log('Applying filters and sort:', currentFilters, currentSort);
    if (!toolsListContainer) return;

    // Show loading indicator temporarily
    toolsListContainer.innerHTML = '<p class="loading-indicator">Filtering...</p>';

    // Use setTimeout to allow the loading indicator to render before heavy processing
    setTimeout(() => {
        let filteredTools = [...allToolsData]; // Start with a copy of all tools

        // 1. Apply Search Filter
        const searchTerm = currentFilters.searchTerm.toLowerCase().trim();
        if (searchTerm) {
            filteredTools = filteredTools.filter(tool =>
                (tool.name && tool.name.toLowerCase().includes(searchTerm)) ||
                (tool.description && tool.description.toLowerCase().includes(searchTerm)) ||
                (tool.category && tool.category.toLowerCase().includes(searchTerm))
                // Add more fields to search if needed (e.g., features)
            );
        }

        // 2. Apply Category Filters
        if (currentFilters.categories.size > 0) {
            filteredTools = filteredTools.filter(tool =>
                tool.category && currentFilters.categories.has(tool.category.trim())
            );
        }

        // 3. Apply Pricing Filter
        if (currentFilters.pricing !== 'all') {
            filteredTools = filteredTools.filter(tool => {
                // Assuming pricing info is structured like: tool.pricing.model or tool.pricing.type
                const toolPricingModel = tool.pricing?.model?.toLowerCase() || tool.pricing?.type?.toLowerCase() || '';
                const filterPricing = currentFilters.pricing;

                if (filterPricing === 'free') {
                    return toolPricingModel.includes('free') && !toolPricingModel.includes('paid') && !toolPricingModel.includes('freemium');
                }
                if (filterPricing === 'freemium') {
                    return toolPricingModel.includes('freemium');
                }
                 if (filterPricing === 'paid') {
                    // Includes 'paid', 'subscription', 'one-time', etc., but NOT explicitly 'free' or 'freemium' unless they also mention paid tiers
                    return (toolPricingModel.includes('paid') || toolPricingModel.includes('subscription') || toolPricingModel.includes('one-time'))
                           && !toolPricingModel.includes('free tier only'); // Example exclusion
                }
                return false; // Should not happen if filterPricing is 'all'
            });
        }

        // 4. Apply Feature Filters
        if (currentFilters.features.size > 0) {
            filteredTools = filteredTools.filter(tool => {
                const toolFeatures = new Set();
                 if (Array.isArray(tool.features)) {
                    tool.features.forEach(f => toolFeatures.add(f.trim()));
                 }
                 if (tool.common_features && typeof tool.common_features === 'object') {
                    Object.keys(tool.common_features).forEach(f => toolFeatures.add(f.trim()));
                 }
                // Check if ALL selected features are present in the tool's features
                return Array.from(currentFilters.features).every(filterFeature =>
                    toolFeatures.has(filterFeature)
                );
            });
        }

        // 5. Apply Sorting
        switch (currentSort) {
            case 'alpha-asc':
                filteredTools.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'alpha-desc':
                filteredTools.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            // Add 'recent' case if data includes a timestamp/date field
            // case 'recent':
            //     filteredTools.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
            //     break;
            case 'default':
            default:
                // No specific sort, maintain original (or API-provided) order
                // Or potentially sort by a default metric if available
                break;
        }

        // 6. Display the final list
        displayTools(filteredTools);
        console.log(`Displayed ${filteredTools.length} tools after filtering/sorting.`);

    }, 50); // Small delay for rendering loading state
}


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', async () => {
    // Theme Toggle Logic (Keep as is)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const themes = ['light', 'dark', 'spotify'];
      let currentTheme = calculateInitialTheme();

      // Ensure the calculated theme is valid
      if (!themes.includes(currentTheme)) {
        currentTheme = 'spotify'; // Fallback to spotify if invalid
      }

      // Apply the initial theme
      updateThemeAttribute(currentTheme);
      localStorage.setItem('theme', currentTheme); // Save the initial or corrected theme

      // Event listener for the toggle button
      themeToggle.addEventListener('click', () => {
        console.log('Theme toggle clicked');
        let currentThemeIndex = themes.indexOf(currentTheme);
        let nextThemeIndex = (currentThemeIndex + 1) % themes.length;
        let nextTheme = themes[nextThemeIndex];

        console.log(`Current theme: ${currentTheme}, Next theme: ${nextTheme}`);

        // Update theme attribute and save to localStorage
        updateThemeAttribute(nextTheme);
        localStorage.setItem('theme', nextTheme);
        console.log(`Theme toggled to ${nextTheme} mode`);

        // Update currentTheme for the next click
        currentTheme = nextTheme;
      });
    } else {
      console.log('Theme toggle element not found');
    }

    // Mobile Nav Toggle Logic (Keep as is)
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.setAttribute(
          'aria-expanded',
          navLinks.classList.contains('active')
        );
      });
    }

    // --- Load Initial Data and Set Up Filters/Sorting ---
    if (toolsListContainer) {
        try {
            console.log('Loading all tool data for homepage...');
            toolsListContainer.innerHTML = '<p class="loading-indicator">Loading tools...</p>'; // Initial loading state

            allToolsData = await loadAllToolsData(); // Store fetched data globally
            console.log(`Loaded ${allToolsData.length} tools.`);

            populateFilters(allToolsData); // Populate filter options
            displayTools(allToolsData); // Display the initial full list

            // --- Setup Event Listeners AFTER data is loaded and filters populated ---
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    currentFilters.searchTerm = e.target.value;
                    applyFiltersAndSort();
                });
            }

            if (categoryFiltersContainer) {
                categoryFiltersContainer.addEventListener('change', (e) => {
                    if (e.target.type === 'checkbox' && e.target.dataset.filterType === 'category') {
                        if (e.target.checked) {
                            currentFilters.categories.add(e.target.value);
                        } else {
                            currentFilters.categories.delete(e.target.value);
                        }
                        applyFiltersAndSort();
                    }
                });
            }

             if (pricingFiltersContainer) {
                pricingFiltersContainer.addEventListener('change', (e) => {
                    if (e.target.type === 'radio' && e.target.name === 'pricing-filter') {
                        currentFilters.pricing = e.target.value;
                        applyFiltersAndSort();
                    }
                });
            }

            if (featureFiltersContainer) {
                 featureFiltersContainer.addEventListener('change', (e) => {
                    if (e.target.type === 'checkbox' && e.target.dataset.filterType === 'feature') {
                        if (e.target.checked) {
                            currentFilters.features.add(e.target.value);
                        } else {
                            currentFilters.features.delete(e.target.value);
                        }
                        applyFiltersAndSort();
                    }
                });
            }

            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    currentSort = e.target.value;
                    applyFiltersAndSort();
                });
            }

        } catch (error) {
            console.error('Error loading or setting up tools on homepage:', error);
            if (toolsListContainer) {
                toolsListContainer.innerHTML = '<p class="empty-state">Could not load tools. Please try again later.</p>';
            }
        }
    } else {
        console.log('Tool list container (#tools-list) not found on this page.');
    }
});

// Removed old theme function
