export default (env, argv) => {
  const mode = argv.mode;
  const isProd = mode === 'production';

  return {
    entry: __dirname + '/main.ts',
    output: {
      filename: isProd ? 'app_one.prod.js' : 'app_one.dev.js',
    },
  };
};
