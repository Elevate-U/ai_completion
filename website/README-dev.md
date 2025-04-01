# Local Development Setup

## Option 1: VS Code Live Server (Recommended)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"
3. The page will open at `http://localhost:5500/website/index.html`

## Option 2: Node.js Express Server (ES Modules)

1. Make sure you have Node.js installed
2. Install dependencies: `npm install express`
3. Start the server: `node website/local-dev-server.js`
4. Open `http://localhost:3000/website/index.html`

## Important Notes:

- All file paths in your code are now relative to the website root
- The server must be running for the fetch requests to work
- CORS errors will disappear when using either method
- Requires Express 4.18+ for ES module support
