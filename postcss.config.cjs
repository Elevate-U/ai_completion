module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-media-queries': true,
      },
    }),
    require('postcss-combine-duplicated-selectors'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' ? require('cssnano') : false,
  ].filter(Boolean),
};
