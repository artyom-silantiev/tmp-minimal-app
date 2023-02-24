export function camelToSnake(str: string) {
  if (str[0] === str[0].toUpperCase()) {
    str = str.replace(/^([A-Z])/g, (g) => g.toLocaleLowerCase());
  }

  return str
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .join('_')
    .toLowerCase();
}
