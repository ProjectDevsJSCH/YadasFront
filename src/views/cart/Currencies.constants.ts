export class CurrencyConstants {
  static readonly CURRENCIES_IMAGES = {
    USD: 'united-states.svg',
    CNY: 'china.svg',
    EUR: 'european-union.svg',
    JPY: 'japan.svg',
    COP: 'colombia.svg',
  };

  static readonly CURRENCIES_LIST = Object.keys(CurrencyConstants.CURRENCIES_IMAGES);
}
