// Tab system implementation - moved from tool-details.js
import { renderFeaturesTabContent } from './FeaturesTab.js';
import { renderPricingTabContent } from './PricingTab.js';
import { renderUseCasesTabContent } from './UseCasesTab.js';
// Import renderers for the new tabs
import { renderProsConsSection } from './ProsConsSection.js';
import { renderReviewsSection } from './ReviewsSection.js';
import { renderIntegrationsSection } from './IntegrationsSection.js';
import { renderTechnicalSection } from './TechnicalSection.js';
import { renderResourcesSection } from './ResourcesSection.js';
import { initializeMermaid } from '../utils/mermaid.js';

export function renderTabSystem() {
  // Define the tabs structure
  const tabs = [
    { id: 'features-tab', label: 'Features', active: true },
    { id: 'pricing-tab', label: 'Pricing' },
    { id: 'usecases-tab', label: 'Use Cases' },
    { id: 'analysis-tab', label: 'Analysis' }, // New: Pros/Cons
    { id: 'community-tab', label: 'Community' }, // New: Reviews
    { id: 'integrations-tab', label: 'Integrations' }, // New
    { id: 'technical-tab', label: 'Technical' }, // New
    { id: 'resources-tab', label: 'Resources' }, // New
  ];

  // Generate tab buttons HTML
  const tabButtonsHtml = tabs
    .map(
      (tab) => `
        <button class="tool-tab ${tab.active ? 'active' : ''}" data-target="${tab.id}">${tab.label}</button>
    `
    )
    .join('');

  // Generate tab content divs HTML
  const tabContentsHtml = tabs
    .map(
      (tab) => `
        <div id="${tab.id}" class="tab-content ${tab.active ? 'active' : ''}"></div>
    `
    )
    .join('');

  return `
        <div class="tabs-container">
            <div class="tab-nav">
                ${tabButtonsHtml}
            </div>
            ${tabContentsHtml}
        </div>
    `;
}

export function initTabs() {
  const tabs = document.querySelectorAll('.tool-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Tab switching logic
      document
        .querySelectorAll('.tool-tab')
        .forEach((t) => t.classList.remove('active'));
      document
        .querySelectorAll('.tab-content')
        .forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      const targetTab = document.getElementById(tab.dataset.target);
      if (targetTab) targetTab.classList.add('active');
    });
  });
}

export async function renderTabContents(tool) {
  console.log('renderTabContents called');
  // Get references to all tab content containers
  const featuresTab = document.getElementById('features-tab');
  const pricingTab = document.getElementById('pricing-tab');
  const useCasesTab = document.getElementById('usecases-tab');
  const analysisTab = document.getElementById('analysis-tab');
  const communityTab = document.getElementById('community-tab');
  const integrationsTab = document.getElementById('integrations-tab');
  const technicalTab = document.getElementById('technical-tab');
  const resourcesTab = document.getElementById('resources-tab');

  // Render content for each tab (awaiting async ones if necessary)
  // Note: Assuming the new section renderers are synchronous for now. Adjust with 'await' if they become async.
  if (featuresTab) featuresTab.innerHTML = await renderFeaturesTabContent(tool);
  if (pricingTab) pricingTab.innerHTML = await renderPricingTabContent(tool);
  if (useCasesTab) useCasesTab.innerHTML = await renderUseCasesTabContent(tool);
  if (analysisTab) analysisTab.innerHTML = renderProsConsSection(tool); // Render Pros/Cons here
  if (communityTab) communityTab.innerHTML = renderReviewsSection(tool); // Render Reviews here
  if (integrationsTab)
    integrationsTab.innerHTML = renderIntegrationsSection(tool); // Render Integrations here
  if (technicalTab) technicalTab.innerHTML = renderTechnicalSection(tool); // Render Technical here
  if (resourcesTab) resourcesTab.innerHTML = renderResourcesSection(tool); // Render Resources here

  // Initialize Mermaid after all content is potentially rendered
  setTimeout(initializeMermaid, 0);
}
