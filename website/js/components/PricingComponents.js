// Helper function to render a value, handling objects
function renderValue(value) {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // Basic stringify for now, could be enhanced later
    // e.g., check for specific keys like 'price', 'unit'
    // Using JSON.stringify(value, null, 2) for pretty print might be too verbose for a table cell
    // Let's try a compact JSON string first.
    return JSON.stringify(value);
  }
  // Handle potential arrays within cells if needed, otherwise default rendering
  if (Array.isArray(value)) {
      return value.map(renderValue).join(', '); // Render array elements recursively
  }
  return value ?? ''; // Handle null/undefined for primitive types
}

export function renderPricingTable(pricingData) { // pricingData is now the whole pricing object from JSON
  if (!pricingData || typeof pricingData !== 'object' || Object.keys(pricingData).length === 0) {
     return '<p class="tab-no-data">No pricing information available</p>';
  }

  // Prioritize scraped table data if it exists and is valid
  const scrapedTables = pricingData.scraped_pricing_tables;
  if (scrapedTables && Array.isArray(scrapedTables) && scrapedTables.length > 0 && scrapedTables[0]?.data && Array.isArray(scrapedTables[0].data)) {
    console.log("Rendering scraped pricing tables."); // Debug log
    // Handle the scraped structure: [{ title: "...", data: [...] }, ...]
    const tablesHtml = scrapedTables.map((tableObject, tableIndex) => {
    // Handle the scraped structure: [{ title: "...", data: [...] }, ...]
      // --- RENDER LOGIC FOR A SINGLE SCRAPED TABLE ---
      if (!tableObject || !Array.isArray(tableObject.data)) {
        console.error(`PricingComponents: Invalid table object at index ${tableIndex}`, tableObject);
        return `<div class="tab-section"><h3 class="tab-subheader">Error</h3><p class="tab-no-data">Invalid table data structure.</p></div>`;
      }

      const tableData = tableObject.data;
      const tableTitle = tableObject.title || `Pricing Table ${tableIndex + 1}`;

      if (tableData.length === 0) {
        // Render title but indicate no data for this specific table
        return `<div class="tab-section"><h3 class="tab-subheader">${tableTitle}</h3><p class="tab-no-data">No data found for this section.</p></div>`;
      }

      // --- Generate Headers for this specific table ---
      const headersHtml = (() => {
        try {
          // Ensure tableData[0] exists and is an object before getting keys
          if (typeof tableData[0] !== 'object' || tableData[0] === null) {
             console.error(`PricingComponents: First row of table "${tableTitle}" is not an object:`, tableData[0]);
             return '<th>Error: Invalid Header Row</th>';
          }
          return Object.keys(tableData[0]).map(header => `<th>${header}</th>`).join('');
        } catch (e) {
          console.error(`PricingComponents: Error generating headers for table "${tableTitle}":`, e);
          return '<th>Error</th>';
        }
      })();

      // --- Generate Body Rows for this specific table ---
      const bodyRowsHtml = (() => {
        try {
          return tableData.map((row, rowIndex) => {
            if (typeof row !== 'object' || row === null) {
               console.error(`PricingComponents: Row ${rowIndex} in table "${tableTitle}" is not an object:`, row);
               // Attempt to get number of headers for colspan, default to a large number
               const headerCount = (typeof tableData[0] === 'object' && tableData[0] !== null) ? Object.keys(tableData[0]).length : 10;
               return `<tr><td colspan="${headerCount}">Invalid row data</td></tr>`;
            }
            // Use the headers derived from the first row to ensure order
            const headers = (typeof tableData[0] === 'object' && tableData[0] !== null) ? Object.keys(tableData[0]) : [];
            const cellsHtml = headers.map(header => `<td>${renderValue(row[header])}</td>`).join(''); // Use helper to render value
            return `<tr>${cellsHtml}</tr>`;
          }).join('');
        } catch (e) {
          console.error(`PricingComponents: Error generating table body for table "${tableTitle}":`, e);
          return '<tr><td>Error generating body</td></tr>';
        }
      })();

      // --- Assemble Final Table HTML for this specific table ---
      return `
        <div class="tab-section">
          <h3 class="tab-subheader">${tableTitle}</h3>
          <div class="table-wrapper"> <!-- Add wrapper for potential horizontal scroll -->
            <table class="pricing-table">
              <thead>
                <tr>${headersHtml}</tr>
              </thead>
              <tbody>
                ${bodyRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join(''); // Join HTML for all tables

    // This line was duplicated in the previous diff, removing it.

    return tablesHtml;

  } else {
      // Fallback: Render original pricing object as tiers if no valid scraped data exists
      console.log("No valid scraped data found, rendering original pricing object as tiers.");
  // This 'else' was duplicated in the previous diff, removing it.
    // Extract pricing tiers
    const tiers = [];
    for (const [key, value] of Object.entries(pricingData)) {
      if (typeof value === 'object' && value !== null &&
          !Array.isArray(value) && key !== 'model' &&
          key !== 'overall_notes' && key !== 'last_updated') {
        const tierDetails = Object.entries(value).map(([k, v]) => ({
          label: k.replace(/_/g, ' '),
          value: v
        }));
        // Sort details alphabetically by label (case-insensitive)
        tierDetails.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
        tiers.push({
          name: key.replace(/_/g, ' ').toUpperCase(),
          details: tierDetails // Use the sorted details array
        });
      }
    }
    // Sort tiers alphabetically by name (case-insensitive)
    tiers.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));


    // Generate HTML for free tier, notes, and then dynamic tiers
    let fallbackHtml = '';

    // Render Free Tier if available
    if (pricingData.free_tier) {
      fallbackHtml += `
        <div class="tab-section">
          <h3 class="tab-subheader">Free Tier</h3>
          <p>${pricingData.free_tier}</p>
        </div>
      `;
    }

    // Render Paid Tiers array if it exists
    if (pricingData.paid_tiers && Array.isArray(pricingData.paid_tiers) && pricingData.paid_tiers.length > 0) {
        fallbackHtml += `
            <div class="tab-section">
                <h3 class="tab-subheader">Paid Tiers</h3>
                ${pricingData.paid_tiers.map(tier => `
                    <div class="paid-tier-card">
                        ${tier.name ? `<h4>${tier.name}</h4>` : ''}
                        ${tier.description ? `<p>${tier.description}</p>` : ''}
                        ${/* Add more details from tier object if needed, e.g., price, features */''}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        // Fallback: Render dynamically found object keys as tiers ONLY if paid_tiers array doesn't exist
        fallbackHtml += tiers.map(tier => `
          <div class="tab-section">
            <h3 class="tab-subheader">${tier.name}</h3>
            <div class="table-wrapper"> <!-- Add wrapper for consistency -->
              <table class="pricing-table">
                <tbody> <!-- Add tbody for semantic correctness -->
                  ${tier.details.map(item => `
                    <tr>
                      <td>${item.label}</td>
                      <td>${renderValue(item.value)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('');
    }
    // Render Notes if available (different from overall_notes handled in PricingTab.js)
    if (pricingData.notes) {
       fallbackHtml += `
        <div class="tab-section">
          <h3 class="tab-subheader">Pricing Notes</h3>
          <p>${pricingData.notes}</p>
        </div>
      `;
    }

    // If no tiers were found AND no free tier/notes, show a message
    if (fallbackHtml.trim() === '') {
        return '<p class="tab-no-data">Detailed pricing tiers not available in the expected format.</p>';
    }

    return fallbackHtml; // Return the combined HTML

  }
}
