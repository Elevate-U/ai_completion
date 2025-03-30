// Tool Details Page Functionality

// DOM Elements
const toolDetailsContent = document.getElementById('tool-details-content');

// Function to display tool details
function displayToolDetails(tool) {
    if (!toolDetailsContent) {
        console.error("Tool details content element not found.");
        return;
    }

    // Basic structure - can be enhanced significantly
    toolDetailsContent.innerHTML = `
        <div class="tool-header">
            <h1>${tool.name}</h1>
            <span class="category-badge">${tool.category}</span>
        </div>

        ${tool.description ? `
        <section class="tool-section">
            <h3>Description</h3>
            <p>${tool.description}</p>
        </section>
        ` : ''}

        ${tool.features && tool.features.length > 0 ? `
        <section class="tool-section">
            <h3>Key Features</h3>
            <ul>${tool.features.map(f => `<li>${f}</li>`).join('')}</ul>
        </section>
        ` : ''}

        ${tool.pricing ? `
        <section class="tool-section">
            <h3>Pricing</h3>
            <p><strong>Model:</strong> ${tool.pricing.model || 'N/A'}</p>
            <p><strong>Free Tier:</strong> ${tool.pricing.free_tier ? 'Yes' : 'No'}</p>
            ${tool.pricing.details ? `<p><strong>Details:</strong> ${tool.pricing.details}</p>` : ''}
        </section>
        ` : ''}

        ${tool.pros && tool.pros.length > 0 ? `
        <section class="tool-section">
            <h3>Pros</h3>
            <ul>${tool.pros.map(p => `<li>${p}</li>`).join('')}</ul>
        </section>
        ` : ''}

         ${tool.cons && tool.cons.length > 0 ? `
        <section class="tool-section">
            <h3>Cons</h3>
            <ul>${tool.cons.map(c => `<li>${c}</li>`).join('')}</ul>
        </section>
        ` : ''}

        ${tool.technical_specifications ? `
        <section class="tool-section">
            <h3>Technical Specs</h3>
            <p><strong>API Type:</strong> ${tool.technical_specifications.api_type || 'N/A'}</p>
            <!-- Add more specs as needed -->
        </section>
        ` : ''}

         ${tool.scalability ? `
        <section class="tool-section">
            <h3>Scalability</h3>
            <p>${tool.scalability}</p>
        </section>
        ` : ''}

         ${tool.support_options && tool.support_options.length > 0 ? `
        <section class="tool-section">
            <h3>Support</h3>
            <ul>${tool.support_options.map(s => `<li>${s}</li>`).join('')}</ul>
        </section>
        ` : ''}

        <!-- Add more sections as needed: Use Cases, Integrations, etc. -->
    `;
}

// Function to handle page initialization
function initToolDetailsPage() {
    console.log("[tool-details.js] Initializing Tool Details Page...");

    if (!toolDetailsContent) {
         console.error("[tool-details.js] Cannot initialize: tool-details-content element not found.");
         return;
    }

    // 1. Get tool ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const toolId = urlParams.get('id'); // Get the 'id' parameter

    if (!toolId) {
        console.error("[tool-details.js] Tool ID not found in URL.");
        toolDetailsContent.innerHTML = '<p class="error-message">Error: Tool ID missing from URL.</p>';
        return;
    }

    console.log(`[tool-details.js] Tool ID from URL: ${toolId}`);

    // 2. Check if aiToolsData is ready (from main.js)
    if (typeof aiToolsData === 'undefined' || aiToolsData.length === 0) {
        console.error("[tool-details.js] AI Tools data not available yet.");
        // Display error or keep loading message
        toolDetailsContent.innerHTML = '<p class="error-message">Error: Could not load tool data. Please go back and try again.</p>';
        return;
    }

    // 3. Find the tool by ID (or name as fallback)
    // Decode the ID in case it was URL encoded (e.g., spaces became %20)
    const decodedToolId = decodeURIComponent(toolId);
    console.log(`[tool-details.js] Searching for tool with ID/Name: ${decodedToolId}`);
    const tool = aiToolsData.find(t => (t.id || t.name) === decodedToolId);

    // 4. Display details or error
    if (tool) {
        console.log("[tool-details.js] Tool found:", tool);
        displayToolDetails(tool);
        // Update page title
        document.title = `${tool.name} Details - AI Tools Resource`;
    } else {
        console.error(`[tool-details.js] Tool with ID/Name "${decodedToolId}" not found.`);
        toolDetailsContent.innerHTML = `<p class="error-message">Error: Tool "${decodedToolId}" not found.</p>`;
    }
}

// Initialize after DOM is loaded and main.js data is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("[tool-details.js] DOMContentLoaded event fired.");
    let checkCounterDetails = 0;
    const maxChecksDetails = 50; // 5 seconds timeout

    const checkDataIntervalDetails = setInterval(() => {
        checkCounterDetails++;
        console.log(`[tool-details.js] Checking for aiToolsData... Attempt: ${checkCounterDetails}`);

        if (typeof aiToolsData !== 'undefined' && aiToolsData.length >= 0) { // Check >= 0 to handle empty data case
             console.log("[tool-details.js] aiToolsData found (or empty array ready), clearing interval and initializing page.");
             clearInterval(checkDataIntervalDetails);
             initToolDetailsPage();
        } else if (checkCounterDetails >= maxChecksDetails) {
             console.error("[tool-details.js] Timeout waiting for aiToolsData. Clearing interval.");
             clearInterval(checkDataIntervalDetails);
             if (toolDetailsContent) {
                 toolDetailsContent.innerHTML = '<p class="error-message">Timeout loading tool data. Please refresh.</p>';
             }
        }
    }, 100); // Check every 100ms
});