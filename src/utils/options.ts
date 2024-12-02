export function optionsToObject(options: Array<any> | null): any {
  if (options == null) {
    return {};
  }

  return options.reduce((x, y) => ({ ...x, [y.name]: y.value }), {});
} 