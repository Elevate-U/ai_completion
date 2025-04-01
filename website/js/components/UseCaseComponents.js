// Use Cases tab sub-components
import { escapeHtml } from '../utils/htmlUtils.js'; // Import shared escape function

export function renderUseCaseCards(useCases) {
  if (!useCases || useCases.length === 0) {
    return '<div class="no-cases">No use cases available</div>';
  }

  return `
        <div class="use-case-grid">
            ${useCases
              .map(
                (useCase) => `
                <div class="use-case-card">
                    <h5>${escapeHtml(useCase.title || 'Untitled Use Case')}</h5>
                    <p>${escapeHtml(useCase.description || 'No description.')}</p>
                    <div class="example">
                        ${useCase.example ? `<pre><code>${escapeHtml(useCase.example)}</code></pre>` : ''}
                    </div>
                </div>
            `
              )
              .join('')}
        </div>
    `;
}

export function renderUseCaseDiagram(/* diagramData */) {
  // Implementation for use case diagrams
  return '<div class="use-case-diagram">Diagram will be rendered here</div>';
}

// Function to render user reviews based on the observed data structure
export function renderUserReviews(reviews) {
  // Check if there's any review data at all
  if (
    !reviews ||
    typeof reviews !== 'object' ||
    Object.keys(reviews).length === 0
  ) {
    return '<div class="no-reviews">No user review information available</div>';
  }

  // Helper function to generate star rating (basic example)
  const renderRating = (ratingString) => {
    if (!ratingString || typeof ratingString !== 'string')
      return '<span>N/A</span>';
    const ratingMatch = ratingString.match(/^(\d+(\.\d+)?)\s*\/\s*(\d+)/);
    if (!ratingMatch) return `<span>${ratingString}</span>`; // Return original string if format is unexpected

    const score = parseFloat(ratingMatch[1]);
    const maxScore = parseInt(ratingMatch[3], 10);
    // const percentage = (score / maxScore) * 100; // Unused variable
    // Simple star representation (could be enhanced with icons)
    const filledStars = Math.round(score);
    const emptyStars = maxScore - filledStars;
    return `<span title="${ratingString}" style="color: gold;">${'★'.repeat(filledStars)}</span><span style="color: lightgray;">${'☆'.repeat(emptyStars)}</span> (${ratingString})`;
  };

  let sourcesHtml = '';
  if (reviews.sources && reviews.sources.length > 0) {
    sourcesHtml = `
      <div class="review-sources">
        ${reviews.sources
          .map(
            (source) => `
          <div class="review-source-card">
            <h5>${escapeHtml(source.name || 'Source')}</h5>
            <p><strong>Rating:</strong> ${renderRating(source.rating)}</p>
            ${source.review_count ? `<p><strong>Reviews:</strong> ${escapeHtml(source.review_count.toString())}</p>` : ''}
            ${
              source.highlights && source.highlights.length > 0
                ? `
              <div class="highlights">
                <strong>Highlights:</strong>
                <ul>
                  ${source.highlights.map((hl) => `<li>${escapeHtml(hl)}</li>`).join('')}
                </ul>
              </div>
            `
                : ''
            }
            ${source.source_url ? `<p><a href="${source.source_url}" target="_blank" rel="noopener noreferrer" class="review-source-link">View Source</a></p>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  return `
    <div class="user-reviews-section" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc;">
      <h4 style="margin-bottom: 15px;">User Reviews</h4>
      ${reviews.summary ? `<p style="margin-bottom: 15px; font-style: italic;"><strong>Summary:</strong> ${reviews.summary}</p>` : ''}
      ${reviews.average_rating ? `<p style="margin-bottom: 10px;"><strong>Average Rating:</strong> ${renderRating(reviews.average_rating.toString() + ' / 5')} </p>` : ''}
      ${
        reviews.sentiment_analysis
          ? `
        <div class="sentiment-analysis" style="margin-bottom: 15px;">
          <strong>Sentiment:</strong>
          <span style="color: green;">Positive: ${reviews.sentiment_analysis.positive || 0}%</span> |
          <span style="color: orange;">Neutral: ${reviews.sentiment_analysis.neutral || 0}%</span> |
          <span style="color: red;">Negative: ${reviews.sentiment_analysis.negative || 0}%</span>
        </div>
      `
          : ''
      }
      ${sourcesHtml ? `<h5 style="margin-top: 20px; margin-bottom: 10px; border-top: 1px dashed #ddd; padding-top: 15px;">Review Sources:</h5>${sourcesHtml}` : ''}
    </div>
  `;
}
