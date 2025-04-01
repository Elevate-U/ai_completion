# CSS Improvement Tooling Configurations

## PostCSS Configuration

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-media-queries': true,
        'color-mod-function': { unresolved: 'warn' }
      }
    }),
    require('postcss-combine-duplicated-selectors'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' ? require('cssnano') : false
  ].filter(Boolean)
}
```

## Stylelint Configuration

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended'
  ],
  plugins: [
    'stylelint-order',
    'stylelint-declaration-block-no-ignored-properties'
  ],
  rules: {
    'order/order': [
      'custom-properties',
      'declarations'
    ],
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      // ...full property order list
    ],
    'declaration-block-no-duplicate-properties': true,
    'no-descending-specificity': null
  }
}
```

## Setup Instructions

1. Install required dependencies:
```bash
npm install --save-dev \
  postcss \
  postcss-import \
  postcss-preset-env \
  postcss-combine-duplicated-selectors \
  autoprefixer \
  cssnano \
  stylelint \
  stylelint-config-standard \
  stylelint-order
```

2. Add scripts to package.json:
```json
"scripts": {
  "lint:css": "stylelint '**/*.css'",
  "build:css": "postcss src/css/main.css -o dist/css/main.css"
}
```

## Next Steps

To implement these configurations:
1. Switch to Code mode
2. Create the configuration files
3. Run the setup commands