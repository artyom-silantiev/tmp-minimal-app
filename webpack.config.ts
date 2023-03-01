import * as path from 'path';
import * as webpack from 'webpack';
import nodeWebpack from 'webpack-node-externals';
import 'webpack-dev-server';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import * as _ from 'lodash';
import TerserPlugin from 'terser-webpack-plugin';

export default (env, argv) => {
  if (!env.APP_BUILD_CONF) {
    throw new Error('app build config not found');
  }

  const appName = env.APP_BUILD_CONF;
  const res = require(appName).default;
  const appBuildConfig = res(env, argv);

  console.log('APP_BUILD_CONF', env.APP_BUILD_CONF);
  console.log('appBuildConfig', appBuildConfig);

  const config = {
    resolve: {
      plugins: [new TsconfigPathsPlugin({})],
      extensions: ['.ts', '.js'],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
    },
    target: 'node',
    externals: [nodeWebpack()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
      ],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
          },
        }),
      ],
    },
  } as webpack.Configuration;

  const mergedConfig = _.merge(config, appBuildConfig);

  return mergedConfig;
};
