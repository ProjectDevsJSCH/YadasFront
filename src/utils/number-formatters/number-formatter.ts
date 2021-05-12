export function moneyFormatter(value: number | string) {
  const price = String(value);

  return price.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
}
