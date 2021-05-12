export function noData(str: any) {
  const NO_DATA_STR = 'N/D';

  if (typeof str === 'string') {
    return !str ? NO_DATA_STR : str;
  }

  return str;
}
