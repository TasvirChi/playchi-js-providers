const webpack = require('webpack');
const path = require('path');
const packageData = require('./package.json');

const plugins = [
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(packageData.version),
    __NAME__: JSON.stringify(packageData.name)
  })
];

module.exports = (env, {mode}) => {
  return {
    entry: {
      ovp: './src/t-provider/ovp/index.ts',
      ott: './src/t-provider/ott/index.ts',
      analytics: './src/t-provider/ovp/services/analytics/index.ts',
      bookmark: './src/t-provider/ott/services/bookmark/index.ts',
      stats: './src/t-provider/ovp/services/stats/index.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: pathData =>
        pathData.chunk.name === 'ovp' || pathData.chunk.name === 'ott' ? 'playchi-[name]-provider.js' : 'playchi-[name]-service.js',
      libraryTarget: 'umd',
      clean: true
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    devtool: 'source-map',
    plugins: plugins,
    module: {
      rules: [
        {
          test: /\.(ts|js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    bugfixes: true,
                  }
                ],
                '@babel/preset-typescript'
              ],
              plugins: [['@babel/plugin-transform-runtime']]
            }
          }
        },
      ]
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true
    }
  }
};
