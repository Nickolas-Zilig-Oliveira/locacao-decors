/** Formats digits as a Brazilian phone number while typing: (11) 90000-0000 / (11) 0000-0000. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.replace(/^(\d*)/, "($1");
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d*)/, "($1) $2");
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d*)/, "($1) $2-$3");
  return digits.replace(/^(\d{2})(\d{5})(\d*)/, "($1) $2-$3");
}

/** Formats digits as a CPF while typing: 000.000.000-00. */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/** Formats digits as a CNPJ while typing: 00.000.000/0000-00. */
export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/**
 * Money-mask helpers: typed digits fill in from the right as cents, like a
 * till — typing "27000" shows "270,00". `formatMoneyTyping` takes the raw
 * input value as-you-type; `parseMoneyTyping` reverses it back to a number;
 * `moneyToDisplay` formats an existing number the same way for defaultValue.
 */
export function formatMoneyTyping(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const cents = digits ? parseInt(digits, 10) : 0;
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseMoneyTyping(raw: string): number {
  const digits = String(raw).replace(/\D/g, "");
  return digits ? parseInt(digits, 10) / 100 : 0;
}

export function moneyToDisplay(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
