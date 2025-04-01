// Simple local development server to avoid CORS issues (ES Module version)
import express from 'express';
import path from 'path';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import fs from 'fs/promises'; // Import fs promises API
// Using built-in fetch (available in Node v18+)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..')));
// Serve static files from ai_tools_resource directory
app.use('/ai_tools_resource', express.static(path.join(__dirname, '../ai_tools_resource')));


// Proxy endpoint to bypass CORS for external fetches
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing target URL parameter');
  }

  console.log(`Proxying request to: ${targetUrl}`);

  try {
    const fetchOptions = {
      headers: {
        // Forward some basic headers, avoid host/cookie related ones
        'User-Agent': req.headers['user-agent'] || 'NodeFetchProxy/1.0',
        'Accept': req.headers['accept'] || '*/*',
        'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
      }
    };

    const response = await fetch(targetUrl, fetchOptions);

    // Forward status code
    res.status(response.status);

    // Forward relevant headers (especially Content-Type)
    // Be careful not to forward headers that cause issues (e.g., content-encoding if not handled)
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    // Add other headers you might need to forward

    // Stream the response body back to the client
    Readable.fromWeb(response.body).pipe(res); // Convert Web Stream to Node Stream before piping

  } catch (error) {
    console.error(`Proxy error fetching ${targetUrl}:`, error);
    res.status(500).send(`Error fetching URL: ${error.message}`);
  }
});

// Endpoint to list tool JSON files
app.get('/list-tool-files', async (req, res) => {
  const dataDir = path.join(__dirname, '../ai_tools_resource/data');
  const excludedFiles = new Set([
    'ai_tool_schema_template.json',
    'ai_updates_review.json',
    'tool_analysis_results.json' // Add other non-tool JSONs if needed
  ]);

  try {
    const files = await fs.readdir(dataDir);
    const toolFiles = files.filter(file =>
      file.endsWith('.json') && !excludedFiles.has(file)
    );
    res.json(toolFiles);
  } catch (error) {
    console.error(`Error listing tool files in ${dataDir}:`, error);
    res.status(500).send('Error listing tool files');
  }
});

app.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}/website/index.html`);
  console.log('Access your files through this server to avoid CORS issues');
});