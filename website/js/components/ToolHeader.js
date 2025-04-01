export function renderToolHeader(tool) {
  return `
        <div class="tool-header">
            <h1>${tool.name || 'Unnamed Tool'}</h1>
            <img 
                src="${tool.image_url || ''}" 
                alt="${tool.name || 'Tool'} Logo" 
                class="tool-logo"
                onerror="this.style.display='none';"
            >
            <span class="category-badge">${tool.category || 'Uncategorized'}</span>
        </div>
    `;
}
