// Error handling utilities - moved from tool-details.js
export function showError(message) {
  const container = document.getElementById('tool-details-content');
  if (container) {
    container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <a href="/" class="btn">Return Home</a>
            </div>
        `;
  }
  console.error(message);
}

export function logError(error) {
  console.error('Error:', error);
  // Additional error logging logic can be added here
}
