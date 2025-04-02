// website/js/utils/cardRenderer.js

/**
 * Renders a single tool card element.
 * @param {object} tool - The tool data object.
 * @returns {HTMLElement} The generated tool card element.
 */
export function renderToolCard(tool) {
    const toolCard = document.createElement('div');
    toolCard.className = 'tool-card';
    // Add data attribute for potential click handling if needed elsewhere
    toolCard.dataset.toolId = tool.id || tool.name;

    // --- Card Header ---
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';

    // Add logo if available
    if (tool.logo_url) {
        const toolLogo = document.createElement('img');
        toolLogo.src = tool.logo_url;
        toolLogo.alt = `${tool.name || 'Tool'} Logo`;
        toolLogo.className = 'tool-card-logo';
        toolLogo.onerror = (e) => { e.target.style.display='none'; }; // Hide broken images
        cardHeader.appendChild(toolLogo);
    }

    const toolName = document.createElement('h5');
    const toolLink = document.createElement('a');
    // Link directly to details page
    toolLink.href = `tool-details.html?id=${encodeURIComponent(tool.name || tool.id)}`;
    toolLink.textContent = tool.name || 'Unnamed Tool';
    toolName.appendChild(toolLink);
    cardHeader.appendChild(toolName); // Append name after logo

    // --- Card Body ---
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const toolDescription = document.createElement('p');
    toolDescription.className = 'tool-description';
    toolDescription.textContent = tool.description || 'No description available.';
    cardBody.appendChild(toolDescription);

    // Add Category Tag (as a link)
    if (tool.category) {
        const categoryLink = document.createElement('a');
        // Link to categories page, pre-filtered
        categoryLink.href = `categories.html?category=${encodeURIComponent(tool.category.trim())}`;
        categoryLink.className = 'category-badge tool-card-category';
        categoryLink.textContent = tool.category.trim();
        cardBody.appendChild(categoryLink);
    }

    // Add Pricing Indicator
    const pricingModel = tool.pricing?.model?.toLowerCase() || tool.pricing?.type?.toLowerCase() || 'unknown';
    const pricingIndicator = document.createElement('span');
    pricingIndicator.className = 'pricing-indicator'; // Base class
    let pricingText = 'Info'; // Default text

    if (pricingModel.includes('free') && !pricingModel.includes('paid') && !pricingModel.includes('freemium')) {
        pricingText = 'Free';
        pricingIndicator.classList.add('pricing-free');
    } else if (pricingModel.includes('freemium')) {
        pricingText = 'Freemium';
        pricingIndicator.classList.add('pricing-freemium');
    } else if (pricingModel.includes('paid') || pricingModel.includes('subscription') || pricingModel.includes('one-time')) {
        pricingText = 'Paid';
        pricingIndicator.classList.add('pricing-paid');
    } else if (pricingModel.includes('contact')) {
         pricingText = 'Contact Us';
         pricingIndicator.classList.add('pricing-contact');
    }
    // Add more conditions if needed (e.g., 'trial')

    pricingIndicator.textContent = pricingText;
    cardBody.appendChild(pricingIndicator); // Append after category

    // --- Card Footer ---
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';
    const detailsButton = document.createElement('a');
    detailsButton.href = `tool-details.html?id=${encodeURIComponent(tool.name || tool.id)}`;
    detailsButton.className = 'btn btn-secondary btn-sm'; // Use existing button styles
    detailsButton.textContent = 'View Details';
    cardFooter.appendChild(detailsButton);

    // --- Assemble Card ---
    toolCard.appendChild(cardHeader);
    toolCard.appendChild(cardBody);
    toolCard.appendChild(cardFooter);

    return toolCard;
}