// Component to render the User Reviews section

/**
 * Renders the User Reviews section for a tool.
 * @param {object} tool - The tool data object.
 * @returns {string} HTML string for the User Reviews section.
 */
export function renderReviewsSection(tool) {
  const { user_reviews } = tool;

  if (!user_reviews || (!user_reviews.summary && (!user_reviews.sources || user_reviews.sources.length === 0))) {
    return ''; // Don't render if no summary or sources
  }

  const renderSource = (source) => {
    if (!source) return '';

    let sourceName = 'Source';
    let sourceUrl = '';

    if (typeof source === 'string') {
      sourceName = source;
      sourceUrl = source;
    } else {
      sourceName = source.name || 'Source';
      sourceUrl = source.source_url || '';
    }

    const ratingText = source.rating ? `(${source.rating})` : '';
    const reviewCountText = source.review_count ? `${source.review_count} reviews` : '';
    const linkStart = sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">` : '';
    const linkEnd = sourceUrl ? `</a>` : '';

    return `
      <div class="review-source">
        <h4>${linkStart}${sourceName}${linkEnd} ${ratingText} ${reviewCountText}</h4>
        ${source.highlights && source.highlights.length > 0 ? `
          <ul>
            ${source.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
  };

  return `
    <section class="tool-section reviews-section">
      <h2>User Reviews</h2>
      ${user_reviews.summary ? `<p class="review-summary">${user_reviews.summary}</p>` : ''}
      ${user_reviews.sources && user_reviews.sources.length > 0 ? `
        <div class="review-sources-container">
          ${user_reviews.sources.map(renderSource).join('')}
        </div>
      ` : ''}
    </section>
  `;
}