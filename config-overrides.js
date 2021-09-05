const { override, adjustStyleLoaders, addBabelPlugins } = require('customize-cra');
module.exports = override(
  adjustStyleLoaders(rule => {
    if (rule.test.toString().includes('scss')) {
      rule.use.push({
        loader: require.resolve('sass-resources-loader'),
        options: {
          resources: './src/assets/styled/index.scss'
        }
      })
    }
  })
)
