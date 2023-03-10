export default (argv) => {
  const mode = argv.mode;
  const isProd = mode === 'production';

  return {
    input: __dirname + '/main.ts',
    output: {
      file: `app_two.${isProd ? 'prod' : 'dev'}.js`,
    },
  };
};
