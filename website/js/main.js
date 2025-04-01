// Parallax effect for hero section
window.addEventListener('scroll', function() {
  const hero = document.querySelector('.hero-section');
  if (hero) {
    const scrollPosition = window.pageYOffset;
    const heroImage = hero.querySelector('.hero-image');
    if (heroImage) {
      heroImage.style.transform = `translateY(${scrollPosition * 0.3}px)`;
    }
  }
});
// Helper function to calculate the initial theme
function calculateInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

  if (savedTheme) {
    return savedTheme; // Use saved theme if available
  }

  if (systemPrefersDark) {
    return 'dark'; // Use system preference if no saved theme
  }

  return 'spotify'; // Default to Spotify theme
}

// Helper function to update the theme attribute on the HTML element
function updateThemeAttribute(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const themes = ['light', 'dark', 'spotify'];
    let currentTheme = calculateInitialTheme();

    // Ensure the calculated theme is valid
    if (!themes.includes(currentTheme)) {
      currentTheme = 'spotify'; // Fallback to spotify if invalid
    }

    // Apply the initial theme
    updateThemeAttribute(currentTheme);
    localStorage.setItem('theme', currentTheme); // Save the initial or corrected theme

    // Event listener for the toggle button
    themeToggle.addEventListener('click', () => {
      console.log('Theme toggle clicked');
      let currentThemeIndex = themes.indexOf(currentTheme);
      let nextThemeIndex = (currentThemeIndex + 1) % themes.length;
      let nextTheme = themes[nextThemeIndex];

      console.log(`Current theme: ${currentTheme}, Next theme: ${nextTheme}`);

      // Update theme attribute and save to localStorage
      updateThemeAttribute(nextTheme);
      localStorage.setItem('theme', nextTheme);
      console.log(`Theme toggled to ${nextTheme} mode`);

      // Update currentTheme for the next click
      currentTheme = nextTheme;
    });
  } else {
    console.log('Theme toggle element not found');
  }

  // Mobile Nav Toggle

  const navToggle = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      navToggle.setAttribute(
        'aria-expanded',
        navLinks.classList.contains('active')
      );
    });
  }

  // Load Featured Categories and Recent Updates from markdown
  async function loadFeaturedData() {
    try {
      const resourcePath = 'featured_content.json'; // Use the new JSON file
      console.log('Attempting to fetch featured data from:', resourcePath);
      const response = await fetch(resourcePath);
      if (!response.ok) throw new Error('Failed to load featured data');
      const data = await response.json(); // Parse the JSON response

      const categories = data.categories || []; // Get categories from JSON
      const updates = data.updates || []; // Get updates from JSON

      // Display Featured Categories
      const categoriesList = document.getElementById('categories-list');
      if (categoriesList) {
        categoriesList.innerHTML = categories
          .map(
            (category) => `
                    <div class="category-card">
                        <h3>${category}</h3>
                        <p>Explore the best ${category}.</p>
                        <a href="categories.html" class="btn btn-primary">View Tools</a>
                    </div>
                `
          )
          .join('');
      }

      // Display Recent Updates
      const recentUpdatesList = document.getElementById('recent-updates');
      if (recentUpdatesList) {
        recentUpdatesList.innerHTML = updates
          .map(
            (update) => `
                    <li>${update}</li>
                `
          )
          .join('');
      }
    } catch (error) {
      console.error('Error loading featured data:', error);
      // Fallback to empty arrays
      const categoriesList = document.getElementById('categories-list');
      if (categoriesList) categoriesList.innerHTML = '';
      const recentUpdatesList = document.getElementById('recent-updates');
      if (recentUpdatesList) recentUpdatesList.innerHTML = '';
    }
  }

  loadFeaturedData();

  // Removed the loadAiToolsData function and its call to implement lazy loading.
  // Tool data is now loaded on demand by tool-details.js or other specific pages.
});

// Removed the old updateThemeClass function as it's replaced by updateThemeAttribute
