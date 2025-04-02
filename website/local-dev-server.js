// Simple local development server (ES Module version)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from the project root directory
// This allows access to /website/index.html, /website/css/, etc.
const projectRoot = path.join(__dirname, '..');
console.log(`[FRONTEND] Serving static files from: ${projectRoot}`);
app.use(express.static(projectRoot));

// Optional: Redirect root path to the main website page
app.get('/', (req, res) => {
  res.redirect('/website/index.html');
});

app.listen(PORT, () => {
  console.log(
    `[FRONTEND] Development server running at http://localhost:${PORT}`
  );
  console.log(
    `[FRONTEND] Access the site at http://localhost:${PORT}/website/index.html`
  );
});

// Add explicit listeners for termination signals to see if they are being received unexpectedly
process.on('SIGINT', () => {
  console.log('[FRONTEND] Received SIGINT. Shutting down.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[FRONTEND] Received SIGTERM. Shutting down.');
  process.exit(0);
});
