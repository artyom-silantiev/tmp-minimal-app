export default (env, argv) => {
  const mode = argv.mode;
  const isProd = mode === 'production';

  return {
    entry: __dirname + '/main.ts',
    output: {
      filename: isProd ? 'app_two.prod.js' : 'app_two.dev.js',
    },
  };
};
