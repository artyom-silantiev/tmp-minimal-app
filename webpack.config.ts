import * as path from 'path';
import * as webpack from 'webpack';
import nodeWebpack from 'webpack-node-externals';
import 'webpack-dev-server';

export default (env, argv) => {
  const mode = argv.mode;
  const isProd = mode === 'production';
  const isDev = !isProd;

  const config = {
    entry: './src/main.ts',
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? 'app.prod.js' : 'app.dev.js',
    },
    target: 'node',
    externals: [nodeWebpack()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: "ts-loader",
        },
      ],
    },
  } as webpack.Configuration;

  return config;
};
