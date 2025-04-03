// Data loading utilities - moved from tool-details.js

// Configuration for the API endpoint
const API_ENDPOINT = 'http://localhost:3001/api/tools'; // New API server endpoint

// Global cache for all tools data to avoid multiple fetches
let allToolsCache = null;
let isFetchingAllTools = false;
let fetchAllToolsPromise = null;

// --- Old file-based loading helpers removed ---

// --- Client-side pricing extraction helpers removed ---
// Pricing data is now expected to be pre-processed by the server-side script
// ai_tools_resource/scripts/update_pricing_data.py and stored in the JSON files
// under the 'scraped_pricing_tables' key within the 'pricing' object.

// --- Text Normalization Helper removed (unused) ---

// Main function to load tool data
export async function loadToolData() {
  const urlParams = new URLSearchParams(window.location.search);
  const toolId = urlParams.get('id'); // Get the raw ID from URL
  if (!toolId) {
    throw new Error('Tool ID missing from URL');
  }

  try {
    // Ensure all data is loaded (or loading) from the API
    const allTools = await loadAllToolsData();

    // Find the specific tool in the cached data
    const decodedToolId = decodeURIComponent(toolId); // Decode for comparison
    const toolData = findToolInData(decodedToolId, allTools);

    if (toolData) {
      return toolData;
    } else {
      throw new Error(`Tool data for "${decodedToolId}" could not be found.`);
    }
  } catch (error) {
    // Re-throw the error to be handled by the caller
    throw new Error(
      `Tool data for "${toolId}" could not be loaded. ${error.message}`
    );
  }
}

// Function to load data for ALL tools
export async function loadAllToolsData() {
  // Return cached data if available
  if (allToolsCache) {
    return allToolsCache;
  }

  // If a fetch is already in progress, return the existing promise
  if (isFetchingAllTools && fetchAllToolsPromise) {
    return fetchAllToolsPromise;
  }

  // Start fetching
  isFetchingAllTools = true;
  fetchAllToolsPromise = (async () => {
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch tool data from API: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('API response is not an array.');
      }
      allToolsCache = data; // Cache the data
      return data;
    } catch (error) {
      allToolsCache = null; // Clear cache on error
      throw new Error(`Could not load tool data from API. ${error.message}`); // Re-throw
    } finally {
      isFetchingAllTools = false; // Reset fetching flag
      // Don't nullify fetchAllToolsPromise here, let subsequent calls use the resolved/rejected promise
    }
  })();

  return fetchAllToolsPromise;
}

// Helper function to search in preloaded data
export function findToolInData(toolId, data) {
  if (!data) return null;
  // Ensure comparison is case-insensitive and handles potential encoding differences
  const normalizedId = toolId.toLowerCase().replace(/\s+/g, '_');
  return data.find((tool) => {
    if (!tool || !tool.name) return false;
    const normalizedToolName = tool.name.toLowerCase().replace(/\s+/g, '_');
    // Also check against the original filename stored in the DB (if we adapt the API later)
    // const normalizedFilename = tool.filename ? tool.filename.replace('.json', '').toLowerCase() : '';
    return normalizedToolName === normalizedId; // || normalizedFilename === normalizedId;
  });
}

// --- Removed filename construction tests ---
