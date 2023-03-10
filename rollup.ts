import { OutputOptions, rollup, RollupOptions } from 'rollup';
import yargs from 'yargs';
import * as _ from 'lodash';
import { resolve } from 'path';

import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

type AppBundleConfig = {
  input: string;
  outputBaseName: string;
};

async function build() {
  const argv = yargs(process.argv).argv;

  let mode = 'development';
  if (argv['mode']) {
    if (['development', 'production'].indexOf(argv['mode']) !== -1) {
      mode = argv['mode'];
    } else {
      throw new Error('Bad mode value');
    }
  }

  if (!argv['build_conf']) {
    throw new Error('Argument "build_conf" is required');
  }

  const isProd = mode === 'production';

  const buildConf = argv['build_conf'];
  const appBundleConfig = require(buildConf).default as AppBundleConfig;

  const inputConfig = {
    input: appBundleConfig.input,
    plugins: [typescript()],
  } as RollupOptions;

  if (mode === 'production') {
    (inputConfig.plugins as any[]).push(
      terser({
        keep_classnames: true,
      })
    );
  }

  const outputConfig = {
    file: resolve(
      __dirname,
      'dist',
      `${appBundleConfig.outputBaseName}${isProd ? '.min' : ''}.js`
    ),
    format: 'cjs',
  } as OutputOptions;

  try {
    const bundle = await rollup(inputConfig);
    await bundle.write(outputConfig);
    await bundle.close();
  } catch (error) {
    console.error(error);
  }
}

build();
