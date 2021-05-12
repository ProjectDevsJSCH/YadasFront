import Axios from 'axios';

export abstract class CurrencyApi {
  static async getCurrencyConvertions() {
    const REFERENCE_CURRENCY = 'COP'; // Colombian pesos
    const translationCurrencies = [
      'USD',
      'CNY',
      'EUR',
      'JPY',
    ];

    const currencyData: Promise<{ data: Record<string, number>; }>[] = [];

    translationCurrencies.forEach((currency) => {
      currencyData.push(
        Axios
          .get(`https://free.currconv.com/api/v7/convert?q=${REFERENCE_CURRENCY}_${currency}&compact=ultra&apiKey=8d88d68aa9933aa8bd88`),
      );
    });

    const res = await Promise.all(currencyData);

    return res.reduce((obj: Record<string, number>, response, index) => {
      obj[translationCurrencies[index]] = Object.values(response.data)[0];

      return obj;
    }, {});
  }
}
