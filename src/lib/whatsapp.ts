export const whatsappUrl = (number: string, text: string): string =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`
