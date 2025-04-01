/**
 * Core tab system for tool details page
 */
class ToolDetailsTabs {
  constructor() {
    this.tabs = document.querySelectorAll('.tool-tab');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.activeTab = null;

    this.init();
  }

  init() {
    // Set up event listeners
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.switchTab(tab));
    });

    // Activate first tab by default
    if (this.tabs.length > 0) {
      this.switchTab(this.tabs[0]);
    }
  }

  switchTab(selectedTab) {
    // Deactivate all tabs
    this.tabs.forEach((tab) => tab.classList.remove('active'));
    this.tabContents.forEach((content) => content.classList.remove('active'));

    // Activate selected tab
    selectedTab.classList.add('active');
    const targetContent = document.getElementById(selectedTab.dataset.target);
    if (targetContent) {
      targetContent.classList.add('active');
      this.activeTab = selectedTab.dataset.target;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ToolDetailsTabs();
});
