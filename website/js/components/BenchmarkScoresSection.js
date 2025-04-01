// Component to render the Benchmark Scores section

/**
 * Renders the Benchmark Scores section for a tool.
 * @param {object} tool - The tool data object.
 * @returns {string} HTML string for the benchmark scores section, or empty string if no data.
 */
export function renderBenchmarkScoresSection(tool) {
  if (!tool.benchmark_scores) {
    return ''; // Return empty if no benchmark data exists
  }

  const { overall_performance, accuracy, speed, task_specific } =
    tool.benchmark_scores;

  let taskSpecificHtml = '';
  if (task_specific && Object.keys(task_specific).length > 0) {
    taskSpecificHtml = `
      <h5>Task-Specific Scores:</h5>
      <ul class="list-unstyled">
        ${Object.entries(task_specific)
          .map(
            ([key, value]) =>
              `<li><strong>${formatKey(key)}:</strong> ${value || 'N/A'}</li>`
          )
          .join('')}
      </ul>
    `;
  }

  return `
    <section id="benchmark-scores" class="tool-section card">
      <div class="card-body">
        <h3 class="card-title section-title">Benchmark Scores</h3>
        <div class="row">
          <div class="col-md-4">
            <p><strong>Overall Performance:</strong> ${overall_performance || 'N/A'}</p>
          </div>
          <div class="col-md-4">
            <p><strong>Accuracy:</strong> ${accuracy || 'N/A'}</p>
          </div>
          <div class="col-md-4">
            <p><strong>Speed:</strong> ${speed || 'N/A'}</p>
          </div>
        </div>
        ${taskSpecificHtml}
      </div>
    </section>
  `;
}

/**
 * Helper function to format object keys into readable labels.
 * Example: "intent_classification_chatbot_f1" -> "Intent Classification Chatbot F1"
 * @param {string} key - The object key string.
 * @returns {string} A formatted, more readable string.
 */
function formatKey(key) {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
