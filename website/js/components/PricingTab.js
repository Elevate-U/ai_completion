// Removed fetchPricingData import as scraping is now done server-side
import { renderPricingTable } from './PricingComponents.js';

export async function renderPricingTabContent(tool) {
  // Data is now expected to be pre-processed in the tool object by the backend script.
  // We prioritize 'scraped_pricing_tables' if it exists.
  const pricingData = tool.pricing; // Get the whole pricing object
  const hasScrapedTables =
    pricingData?.scraped_pricing_tables &&
    Array.isArray(pricingData.scraped_pricing_tables) &&
    pricingData.scraped_pricing_tables.length > 0;
  const dataSource = hasScrapedTables
    ? 'scraped_pricing_tables'
    : 'original pricing object';

  console.log(
    `PricingTab: Rendering pricing for "${tool.name}". Using data source: ${dataSource}.`
  );

  // Check if pricingData is valid before rendering
  // Check if we have *any* valid pricing data (either scraped or original)
  if (
    !pricingData ||
    typeof pricingData !== 'object' ||
    Object.keys(pricingData).length === 0
  ) {
    console.warn(`PricingTab: No pricing data found for "${tool.name}".`);
    // Return only the inner content, the container is provided by the caller
    return `
        <h2>${tool.name} Pricing</h2>
        <p class="tab-no-data">Pricing information is currently unavailable or could not be extracted.</p>
    `;
  }

  // Render pricing details safely using optional chaining
  // Return only the inner content, the container is provided by the caller
  return `
      <h2>${tool.name} Pricing</h2>
      <div class="tab-meta">
         ${/* Display last scraped time if available, otherwise original last updated */ ''}
         ${pricingData?.last_scraped_utc ? `Pricing data scraped: ${new Date(pricingData.last_scraped_utc).toLocaleString()}` : pricingData?.last_updated ? `Pricing data last manually updated: ${pricingData.last_updated}` : ''}
         ${pricingData?.model ? `<p>${pricingData.model}</p>` : ''} ${/* Keep original model description */ ''}
      </div>
      ${renderPricingTable(pricingData)} ${/* Pass the whole pricing object to renderPricingTable */ ''}
       ${/* Keep original overall notes */ ''}
      ${
        pricingData?.overall_notes
          ? `
        <div class="tab-notes">
          <h3>Notes:</h3>
          <p>${pricingData.overall_notes}</p>
        </div>
      `
          : ''
      }
  `;
}
