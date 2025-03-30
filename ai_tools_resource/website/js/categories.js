// Categories page functionality (Refined)

// DOM Elements (Ensure these IDs exist in the updated categories.html)
const categorySidebarList = document.getElementById('category-sidebar-list');
const toolsContainer = document.getElementById('tools-container');
const categoryTitle = document.getElementById('category-title');
const categoryDescription = document.getElementById('category-description');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Current state
let currentCategory = 'all'; // Default to 'all'
let currentSearchTerm = '';

// Initialize categories page
function initCategoriesPage() {
    console.log("Initializing Categories Page...");
    // Check if aiToolsData is loaded (global from main.js)
    if (typeof aiToolsData === 'undefined' || aiToolsData.length === 0) {
        console.error("AI Tools data not available for categories page.");
        // Display error messages
        if (categorySidebarList) categorySidebarList.innerHTML = '<p>Error loading categories.</p>';
        if (toolsContainer) toolsContainer.innerHTML = '<p>Error loading tools data. Please try refreshing.</p>';
        if (categoryTitle) categoryTitle.textContent = 'Error';
        if (categoryDescription) categoryDescription.textContent = 'Could not load tool data.';
        return; // Stop initialization
    }

    // Check for category in URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl && aiToolsData.some(tool => tool.category === categoryFromUrl)) {
        currentCategory = categoryFromUrl;
        console.log(`Category from URL: ${currentCategory}`);
    } else {
        currentCategory = 'all'; // Default if no valid category in URL
    }

    displayCategorySidebar();
    displayTools(); // Display tools based on initial category (from URL or 'all')
    setupCategoriesEventListeners();
    console.log("Categories Page Initialized.");
}

// Display all categories in sidebar
function displayCategorySidebar() {
    if (!categorySidebarList) {
        console.warn("Category sidebar list element not found.");
        return;
    }
    const categories = [...new Set(aiToolsData.map(tool => tool.category))].sort();

    let sidebarHTML = `
        <a href="#" class="list-group-item ${currentCategory === 'all' ? 'active' : ''}" data-category="all">
            All Categories
        </a>
        ${categories.map(category => `
            <a href="#" class="list-group-item ${currentCategory === category ? 'active' : ''}" data-category="${category}">
                ${category}
            </a>
        `).join('')}
    `;
    categorySidebarList.innerHTML = sidebarHTML;
}

// Display tools based on current category and search term
function displayTools() {
    if (!toolsContainer || !categoryTitle || !categoryDescription) {
        console.warn("Required elements for displaying tools are missing.");
        return;
    }

    let filteredTools = [...aiToolsData];

    // Filter by category if selected (and not 'all')
    if (currentCategory && currentCategory !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.category === currentCategory);
    }

    // Filter by search term if present
    if (currentSearchTerm) {
        const searchTerm = currentSearchTerm.toLowerCase();
        filteredTools = filteredTools.filter(tool =>
            tool.name.toLowerCase().includes(searchTerm) ||
            tool.category.toLowerCase().includes(searchTerm) ||
            (tool.description && tool.description.toLowerCase().includes(searchTerm)) || // Search description
            (tool.features && tool.features.some(feature => feature.toLowerCase().includes(searchTerm))) // Search features
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
        toolsContainer.innerHTML = filteredTools.map(tool => `
            <div class="tool-card">
                <div class="card-header">
                    <h5>${tool.name}</h5>
                    <span class="badge bg-secondary">${tool.category}</span>
                </div>
                <div class="card-body">
                    ${tool.description ? `<p class="tool-description">${tool.description.substring(0, 100)}${tool.description.length > 100 ? '...' : ''}</p>` : ''}
                    ${tool.features && tool.features.length > 0 ? `
                        <h6>Key Features:</h6>
                        <ul class="feature-list">
                            ${tool.features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
                            ${tool.features.length > 3 ? '<li>...</li>' : ''}
                        </ul>
                    ` : ''}
                    <!-- Add link to a future tool detail page -->
                    <a href="#" class="btn btn-sm btn-primary" data-tool-id="${tool.id || tool.name}">View Details</a>
                </div>
            </div>
        `).join('');
    } else {
        toolsContainer.innerHTML = '<p>No tools found matching your criteria.</p>';
    }
}

// Setup event listeners for categories page
function setupCategoriesEventListeners() {
    console.log("[categories.js] Setting up event listeners..."); // Log setup start
    console.log("[categories.js] toolsContainer element:", toolsContainer); // Log the element

    // Category sidebar click handlers
    if (categorySidebarList) {
        categorySidebarList.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryItem = e.target.closest('[data-category]');
            if (categoryItem && categoryItem.dataset.category !== currentCategory) {
                currentCategory = categoryItem.dataset.category;
                currentSearchTerm = ''; // Reset search when category changes
                if (searchInput) searchInput.value = ''; // Clear search input field
                displayTools();

                // Update active state in sidebar
                document.querySelectorAll('#category-sidebar-list a').forEach(item => {
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
        console.warn("Category sidebar list not found for event listener setup.");
    }

    // Search functionality
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            currentSearchTerm = searchInput.value.trim();
            displayTools();
        });

        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                currentSearchTerm = searchInput.value.trim();
                displayTools();
            }
        });
    } else {
        console.warn("Search input or button not found for event listener setup.");
    }

    // Add listener for future "View Details" buttons if needed
    toolsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.btn[data-tool-id]')) {
            e.preventDefault();
            const toolId = e.target.dataset.toolId;
            console.log(`Navigate to details for tool: ${toolId}`);
            window.location.href = `tool-details.html?id=${encodeURIComponent(toolId)}`; // Uncommented navigation
        }
    });
}

// Initialize when DOM is loaded, ensuring main.js data is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("[categories.js] DOMContentLoaded event fired.");
    let checkCounter = 0; // Counter for checks
    const maxChecks = 50; // Limit checks to 5 seconds

    // Use a more robust check for aiToolsData readiness
    const checkDataInterval = setInterval(() => {
        checkCounter++;
        console.log(`[categories.js] Checking for aiToolsData... Attempt: ${checkCounter}`);

        if (typeof aiToolsData !== 'undefined' && aiToolsData.length > 0) {
            console.log("[categories.js] aiToolsData found, clearing interval and initializing.");
            clearInterval(checkDataInterval);
            initCategoriesPage();
        } else if (typeof aiToolsData !== 'undefined') {
            // Data array exists but is empty (likely load error handled in main.js)
             console.warn("[categories.js] aiToolsData exists but is empty. Clearing interval and attempting init (may show errors).");
             clearInterval(checkDataInterval);
             initCategoriesPage(); // Attempt init to show errors
        } else if (checkCounter >= maxChecks) {
             console.error("[categories.js] Timeout waiting for aiToolsData. Clearing interval.");
             clearInterval(checkDataInterval);
             // Optionally display an error message on the page here
             if (categorySidebarList) categorySidebarList.innerHTML = '<p>Timeout loading data. Please refresh.</p>';
             if (toolsContainer) toolsContainer.innerHTML = '<p>Timeout loading data. Please refresh.</p>';
        }
    }, 100); // Check every 100ms
});