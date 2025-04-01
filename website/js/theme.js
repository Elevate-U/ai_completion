// Theme management module
const themes = ['light', 'dark', 'spotify'];

export function calculateInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;
  return savedTheme || (systemPrefersDark ? 'dark' : 'dark'); // Default to dark
}

export function updateThemeAttribute(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function getNextTheme(currentTheme) {
  const currentIndex = themes.indexOf(currentTheme);
  return themes[(currentIndex + 1) % themes.length];
}
