// Main tool details functionality - Enhanced Hybrid Approach
import {
  calculateInitialTheme,
  updateThemeAttribute,
  getNextTheme,
} from './theme.js';
import { renderToolHeader } from './components/ToolHeader.js';
// Removed TabSystem imports
import { showError } from './utils/errorHandling.js';
import { loadToolData } from './utils/dataLoader.js';
// Import individual content renderers previously called by TabSystem
import { renderFeaturesTabContent } from './components/FeaturesTab.js';
import { renderPricingTabContent } from './components/PricingTab.js';
import { renderUseCasesTabContent } from './components/UseCasesTab.js';

// Import new section components
import { renderProsConsSection } from './components/ProsConsSection.js';
// Removed renderReviewsSection import
import { renderIntegrationsSection } from './components/IntegrationsSection.js';
import { renderTechnicalSection } from './components/TechnicalSection.js';
import { renderResourcesSection } from './components/ResourcesSection.js';
import { renderBenchmarkScoresSection } from './components/BenchmarkScoresSection.js';
import { initializeMermaid } from './utils/mermaid.js'; // Ensure Mermaid init is imported

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  // Theme setup
  const currentTheme = calculateInitialTheme();
  updateThemeAttribute(currentTheme);

  try {
    const toolData = await loadToolData();
    await renderToolDetails(toolData); // Await the async rendering process
  } catch (error) {
    showError(error.message);
  }

  // --- Theme Toggle Implementation ---
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = getNextTheme(currentTheme);
      updateThemeAttribute(nextTheme);
      localStorage.setItem('theme', nextTheme);
    });
  }
});

// Function to render breadcrumbs
function renderBreadcrumbs(tool) {
  const category = tool.category || 'Tools'; // Fallback category
  const toolName = tool.name || 'Tool Details';

  // Basic breadcrumb structure - links can be added if category pages exist
  return `
    <nav aria-label="breadcrumb" class="breadcrumbs-container">
      <ol class="breadcrumbs">
        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
        <li class="breadcrumb-item"><a href="categories.html?category=${encodeURIComponent(category)}">${category}</a></li> 
        <li class="breadcrumb-item active" aria-current="page">${toolName}</li>
      </ol>
    </nav>
  `;
}

// Main rendering function - Enhanced Hybrid Approach
async function renderToolDetails(tool) {
  console.log('renderToolDetails called - rendering sequentially');
  const container = document.getElementById('tool-details-content');
  if (!container) return;

  // --- Render Core Structure Sequentially ---
  // Header + Breadcrumbs + All Sections
  // Using await for async content renderers
  container.innerHTML = `
        ${renderToolHeader(tool)}
        ${renderBreadcrumbs(tool)}
        
        <!-- Render all sections directly -->
        ${await renderFeaturesTabContent(tool)}
        ${await renderPricingTabContent(tool)}
        ${await renderUseCasesTabContent(tool)}
        ${renderProsConsSection(tool)}
        ${renderIntegrationsSection(tool)}
        ${renderTechnicalSection(tool)}
        ${renderResourcesSection(tool)}
        ${renderBenchmarkScoresSection(tool)}
    `;

  // --- Initialize Mermaid ---
  // Needs to run after content is in the DOM
  setTimeout(initializeMermaid, 0);

  console.log('Sequential rendering complete.');
  // Removed tab initialization and summary click listener logic
}

// Obsolete local function removed (logic is now imported from TabSystem.js)
