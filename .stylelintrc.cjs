module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended'],
  plugins: [
    'stylelint-order',
    'stylelint-declaration-block-no-ignored-properties',
  ],
  rules: {
    'order/order': ['custom-properties', 'declarations'],
    'order/properties-order': require('./css-property-order.cjs'),
    'declaration-block-no-duplicate-properties': true,
    'no-descending-specificity': null,
    'selector-class-pattern': null,
  },
};