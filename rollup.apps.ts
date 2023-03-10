import { resolve } from 'path';

export default {
  one: {
    entry: resolve(__dirname, 'src', 'app_one', 'main.ts'),
    outputBaseName: 'app_one',
  },
  two: {
    entry: resolve(__dirname, 'src', 'app_two', 'main.ts'),
    outputBaseName: 'app_two',
  },
};
