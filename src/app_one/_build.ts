export default (argv) => {
  const mode = argv.mode;
  const isProd = mode === 'production';

  return {
    input: __dirname + '/main.ts',
    output: {
      file: `app_one.${isProd ? 'prod' : 'dev'}.ru.js`,
    },
  };
};
