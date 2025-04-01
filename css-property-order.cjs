// Based on our cleaned-up property order
module.exports = [
  // Positioning
  'position', 'z-index', 'top', 'right', 'bottom', 'left',
  'inset', 'inset-block', 'inset-inline',

  // Layout & Flow
  'display', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow',
  'flex-grow', 'flex-shrink', 'flex-basis', 'grid', 'grid-template',
  'grid-template-areas', 'grid-template-rows', 'grid-template-columns',
  'grid-auto-rows', 'grid-auto-columns', 'grid-auto-flow', 'grid-area',
  'grid-row', 'grid-row-start', 'grid-row-end', 'grid-column',
  'grid-column-start', 'grid-column-end', 'gap', 'row-gap', 'column-gap',
  'align-content', 'align-items', 'align-self', 'justify-content',
  'justify-items', 'justify-self', 'order', 'float', 'clear', 'box-sizing',

  // Dimensions
  'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
  'aspect-ratio',

  // Spacing
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-inline', 'padding', 'padding-top', 'padding-right',
  'padding-bottom', 'padding-left', 'padding-block', 'padding-inline',

  // Typography
  'font', 'font-family', 'font-size', 'font-weight', 'font-style',
  'font-variant', 'font-stretch', 'line-height', 'letter-spacing',
  'word-spacing', 'white-space', 'text-align', 'text-align-last',
  'text-decoration', 'text-decoration-color', 'text-decoration-line',
  'text-decoration-style', 'text-decoration-thickness', 'text-emphasis',
  'text-indent', 'text-overflow', 'text-shadow', 'text-transform',
  'text-underline-offset', 'text-underline-position', 'vertical-align',
  'list-style', 'list-style-type', 'list-style-position', 'quotes',
  'hyphens', 'writing-mode', 'direction',

  // Visual Effects
  'color', 'background', 'background-color', 'background-image',
  'background-position', 'background-size', 'background-repeat',
  'background-origin', 'background-clip', 'background-attachment',
  'background-blend-mode', 'border', 'border-width', 'border-style',
  'border-color', 'border-top', 'border-right', 'border-bottom',
  'border-left', 'border-radius', 'border-image', 'box-shadow',
  'opacity', 'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation',

  // Animation & Transform
  'transition', 'transition-property', 'transition-duration',
  'transition-timing-function', 'transition-delay', 'animation',
  'animation-name', 'animation-duration', 'animation-timing-function',
  'animation-delay', 'animation-iteration-count', 'animation-direction',
  'animation-fill-mode', 'animation-play-state', 'transform',
  'transform-origin', 'transform-style', 'perspective',
  'perspective-origin', 'backface-visibility', 'will-change',

  // Misc
  'appearance', 'cursor', 'outline', 'outline-width', 'outline-style',
  'outline-color', 'outline-offset', 'pointer-events', 'resize',
  'scroll-behavior', 'scroll-margin', 'scroll-padding',
  'scroll-snap-align', 'scroll-snap-stop', 'scroll-snap-type',
  'touch-action', 'user-select', 'visibility',

  // CSS Variables
  '--*'
];