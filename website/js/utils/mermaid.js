// Mermaid initialization - moved from tool-details.js
export function initializeMermaid() {
  if (typeof mermaid !== 'undefined') {
    try {
      // Determine Mermaid theme based on HTML data-theme attribute
      const currentTheme = document.documentElement.dataset.theme || 'light';
      let mermaidTheme = 'neutral'; // Use neutral for light theme
      if (currentTheme === 'dark' || currentTheme === 'spotify') {
        mermaidTheme = 'dark';
      }

      mermaid.initialize({
        startOnLoad: false, // We'll call run explicitly
        theme: mermaidTheme,
        securityLevel: 'loose',
        // Optional: Align font with the rest of the site if needed
        // fontFamily: '"Inter", sans-serif',
      });
      mermaid.run({
        nodes: document.querySelectorAll('.mermaid'),
      });
    } catch (error) {
      console.error('Mermaid initialization failed:', error);
    }
  } else {
    console.warn('Mermaid library not found.');
  }
}
