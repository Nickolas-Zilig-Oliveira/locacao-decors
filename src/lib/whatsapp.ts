export function whatsappLink(phone: string | null, message?: string) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountry}${text}`;
}
