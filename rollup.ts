import { rollup, RollupOptions } from 'rollup';
import yargs from 'yargs';
import * as _ from 'lodash';
import { resolve } from 'path';

import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

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

  const buildConf = argv['build_conf'];
  const res = require(buildConf).default;
  const appBuildConfig = res(argv);
  appBuildConfig.output.file = resolve(
    __dirname,
    'dist',
    appBuildConfig.output.file
  );

  const config = {
    output: {
      format: 'cjs',
    },
    plugins: [typescript()],
  } as RollupOptions;

  if (mode === 'production') {
    (config.plugins as any[]).push(
      terser({
        keep_classnames: true,
      })
    );
  }

  const mergedConfig = _.merge(config, appBuildConfig);

  try {
    const bundle = await rollup(mergedConfig);
    const res = await bundle.write(mergedConfig.output);
    await bundle.close();
  } catch (error) {
    console.error(error);
  }
}

build();
