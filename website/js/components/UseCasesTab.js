// Use Cases tab content rendering - moved from tool-details.js
import { renderUseCaseCards, renderUserReviews } from './UseCaseComponents.js';

export function renderUseCasesTabContent(tool) {
  return `
        <section>
            <h2>${tool.name} Use Cases & Reviews</h2>
            ${renderUseCaseCards(tool.use_cases)}
            ${renderUserReviews(tool.user_reviews)}
        </section>
    `;
}
