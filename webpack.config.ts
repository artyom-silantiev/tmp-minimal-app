import * as path from 'path';
import * as webpack from 'webpack';
import nodeWebpack from 'webpack-node-externals';
import 'webpack-dev-server';

const config: webpack.Configuration = {
  entry: './src/app.ts',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
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
};

export default config;
