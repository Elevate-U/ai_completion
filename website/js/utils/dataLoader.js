// Data loading utilities - moved from tool-details.js

// Configuration object for file paths and tool ID mappings
const dataLoaderConfig = {
  dataPath: '../../ai_tools_resource/data/',
  toolIdToFilenameMap: {
    'Dialogflow (Google Conversational AI)': 'dialogflow.json',
    'Microsoft Azure AI Language': 'azure_ai_language.json',
    'Wit.ai (Meta Conversational AI)': 'wit_ai.json',
    'Google Cloud Natural Language API': 'google_cloud_nlp.json', // Added mapping
  },
};

// Helper function: fetch with retry mechanism
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/html',
        },
      });
      // Only proceed if the fetch itself was okay or opaque (CORS issue)
      if (response.ok || response.type === 'opaque') {
        // Return the raw text content for the caller to handle
        // We also pass back the content type header if available
        const contentType = response.headers.get('content-type');
        const text = await response.text();
        return { text, contentType };
      }
      if (response.status === 404) {
        throw new Error(`File not found: ${url}`);
      }
      throw new Error(response.statusText);
    } catch (err) {
      if (i === retries - 1) {
        throw err;
      }
      // Wait for 'delay' milliseconds before retrying
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// Function to construct filename from tool ID
function constructFilename(toolId) {
  const fileName =
    dataLoaderConfig.toolIdToFilenameMap[toolId] ||
    (() => {
      const decodedToolId = decodeURIComponent(toolId);
      return (
        decodedToolId
          .toLowerCase()
          .replace(/[^a-z0-9\s]/gi, '')
          .replace(/\s+/g, '_') + '.json'
      );
    })();
  return fileName;
}

// --- Client-side pricing extraction helpers removed ---
// Pricing data is now expected to be pre-processed by the server-side script
// ai_tools_resource/scripts/update_pricing_data.py and stored in the JSON files
// under the 'scraped_pricing_tables' key within the 'pricing' object.

// --- Text Normalization Helper removed (unused) ---

// Main function to load tool data
export async function loadToolData() {
  console.log('loadToolData called');
  const urlParams = new URLSearchParams(window.location.search);
  const toolId = urlParams.get('id');
  if (!toolId) throw new Error('Tool ID missing from URL');

  // Fetch the specific tool data directly based on ID

  // 2. Fallback to direct fetch
  const fileName = constructFilename(toolId);
  const filePath = `${dataLoaderConfig.dataPath}${fileName}`;
  console.log(`Attempting to load tool data from: ${filePath}`);
  try {
    const toolDataResponse = await fetchWithRetry(filePath); // Get the response object {text, contentType}
    console.log(`Raw tool data loaded successfully from ${filePath}`); // Log raw load
    const toolData = JSON.parse(toolDataResponse.text); // Parse the JSON text
    // console.log(`Tool data parsed successfully:`, toolData); // Optional: Log parsed object if needed for further debugging

    // Client-side fetching logic removed.
    // The toolData loaded from JSON should now contain the pre-processed pricing
    // (including 'scraped_pricing_tables' if the backend script was successful).
    console.log(
      `Loaded tool data for "${toolData.name}" from ${filePath}. Pricing data should be pre-processed.`
    );

    return toolData;
  } catch (error) {
    console.error(`Direct fetch failed: ${error}`);
    throw new Error(
      `Tool data for "${toolId}" could not be loaded. ${error.message}`
    );
  }
}

// Function to load data for ALL tools
export async function loadAllToolsData() {
  console.log('[dataLoader] loadAllToolsData called');
  let toolFilenames = [];

  try {
    // Fetch the list of tool filenames from the server endpoint
    console.log('[dataLoader] Fetching tool file list from /list-tool-files');
    const response = await fetch('/list-tool-files'); // Use the new endpoint
    if (!response.ok) {
      throw new Error(`Failed to fetch tool list: ${response.statusText}`);
    }
    toolFilenames = await response.json();
    console.log(
      `[dataLoader] Received ${toolFilenames.length} tool filenames from server.`
    );
    if (!Array.isArray(toolFilenames)) {
      throw new Error('Received invalid data format for tool list.');
    }
  } catch (error) {
    console.error('[dataLoader] Error fetching tool file list:', error);
    // Optionally, fallback to a hardcoded list or throw error
    // For now, we'll proceed with an empty list which will result in an error later or empty data
    // throw new Error('Could not fetch the list of tool files.');
    toolFilenames = []; // Proceed with empty list on error
  }

  if (toolFilenames.length === 0) {
    console.warn(
      '[dataLoader] No tool filenames found or fetched. Cannot load tool data.'
    );
    return []; // Return empty array if no filenames
  }

  const fetchPromises = toolFilenames.map((fileName) => {
    const filePath = `${dataLoaderConfig.dataPath}${fileName}`;
    return fetchWithRetry(filePath)
      .then((response) => {
        try {
          return JSON.parse(response.text);
        } catch (parseError) {
          console.error(
            `[dataLoader] Failed to parse JSON from ${fileName}:`,
            parseError,
            'Raw text:',
            response.text
          );
          return null; // Return null for files that fail to parse
        }
      })
      .catch((error) => {
        console.error(`[dataLoader] Failed to fetch ${filePath}:`, error);
        return null; // Return null for files that fail to fetch
      });
  });

  try {
    const results = await Promise.all(fetchPromises);
    // Filter out any null results from failed fetches/parses
    const allToolsData = results.filter((data) => data !== null);
    console.log(
      `[dataLoader] Successfully loaded data for ${allToolsData.length} tools.`
    );
    // Warning message is still relevant if some fetches failed within Promise.all
    const expectedCount = toolFilenames.length;
    if (allToolsData.length < expectedCount) {
      console.warn(
        `[dataLoader] Some tool files failed to load or parse. Expected ${expectedCount}, got ${allToolsData.length}.`
      );
    }
    return allToolsData;
  } catch (error) {
    console.error('[dataLoader] Error loading all tool data:', error);
    throw new Error('Could not load all tool data.'); // Re-throw or handle as needed
  }
}

// Helper function to search in preloaded data
export function findToolInData(toolId, data) {
  if (!data) return null;
  const decodedId = decodeURIComponent(toolId);
  return data.find(
    (t) =>
      t.id === decodedId ||
      t.name === decodedId ||
      (t.name &&
        t.name.toLowerCase().replace(/\s+/g, '_') ===
          decodedId.toLowerCase().replace(/\s+/g, '_'))
  );
}

// Unit test for filename construction
function testFilenameConstruction(toolId) {
  const fileName = constructFilename(toolId);
  return fileName;
}

// Test cases
console.assert(
  testFilenameConstruction('Dialogflow (Google Conversational AI)') ===
    'dialogflow.json',
  'Test Case 1 Failed: Dialogflow'
);
console.assert(
  testFilenameConstruction('Amazon Lex') === 'amazon_lex.json',
  'Test Case 2 Failed: Amazon Lex'
);
console.assert(
  testFilenameConstruction('Google Cloud NLP') === 'google_cloud_nlp.json',
  'Test Case 3 Failed: Google Cloud NLP'
);
