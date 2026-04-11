import dayjs from "dayjs";

/**
 * Formats a number as currency in en-US style (e.g. $1,234.56 with two decimal places).
 * @param value - Numeric amount to format
 * @param currency - ISO 4217 code; defaults to USD
 */
export function formatCurrency(
  value: number,
  currency: string = "USD"
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    const negative = value < 0;
    const abs = Math.abs(value);
    const [intRaw, frac = "00"] = abs.toFixed(2).split(".");
    const intPart = intRaw!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const core = `${intPart}.${frac}`;
    if (currency === "USD") {
      return `${negative ? "-" : ""}$${core}`;
    }
    return `${negative ? "-" : ""}${core} ${currency}`;
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
