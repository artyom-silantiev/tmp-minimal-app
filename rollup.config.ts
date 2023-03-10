import { RollupOptions } from 'rollup';
import yargs from 'yargs';
import * as _ from 'lodash';
import { resolve } from 'path';
import apps from './rollup.apps';

import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

type AppBuildInfo = {
  entry: string;
  outputBaseName: string;
};

export default async function () {
  let mode = 'development';
  if (process.env.BUILD_MODE) {
    if (['development', 'production'].indexOf(process.env.BUILD_MODE) !== -1) {
      mode = process.env.BUILD_MODE;
    } else {
      throw new Error('Bad mode value');
    }
  }
  const isProd = mode === 'production';

  let appsToBuild = [] as string[];
  const appName = process.env.BUILD_APP;
  if (appName) {
    appsToBuild = [appName];
  } else {
    appsToBuild = Object.keys(apps);
  }

  const plugins = [typescript()];
  if (mode === 'production') {
    (plugins as any[]).push(
      terser({
        keep_classnames: true,
      })
    );
  }

  const config = [] as RollupOptions[];
  for (const appName of appsToBuild) {
    const appBuildInfo = apps[appName] as AppBuildInfo;

    const bundleFile = resolve(
      __dirname,
      'dist',
      `${appBuildInfo.outputBaseName}${isProd ? '.min' : ''}.js`
    );
    config.push({
      input: appBuildInfo.entry,
      output: {
        file: bundleFile,
        format: 'cjs',
      },
      plugins,
    });
  }

  return config;
}
