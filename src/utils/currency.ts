export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

export const DEFAULT_CURRENCY = "INR";

const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "VND", "CLP", "ISK"]);

export function getCurrencyByCode(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function formatAmount(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = getCurrencyByCode(currencyCode);
  const fractionDigits = ZERO_DECIMAL_CURRENCIES.has(currencyCode) ? 0 : 2;
  return `${currency.symbol}${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function convertAmount(
  amount: number,
  sourceCurrency: string | null | undefined,
  exchangeRate: number | null | undefined,
  targetCurrency: string
): number {
  const value = Number.isFinite(amount) ? amount : 0;
  const rate =
    typeof exchangeRate === "number" && Number.isFinite(exchangeRate) && exchangeRate > 0
      ? exchangeRate
      : 1;

  const converted = sourceCurrency && sourceCurrency === targetCurrency ? value : value * rate;
  return Math.round(converted * 100) / 100;
}
