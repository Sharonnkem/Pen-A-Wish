export function formatNairaFromKobo(amountKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(amountKobo / 100);
}

