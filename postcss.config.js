const production = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: production ? [
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    }),
  ] : [
    require('autoprefixer')
  ],
};