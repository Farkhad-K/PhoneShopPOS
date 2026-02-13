/**
 * Generates a unique barcode for phones
 * Format: PH{timestamp}{random4digits}
 * Example: PH1707830800001234
 */
export function generatePhoneBarcode(): string {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `PH${timestamp}${random}`;
}

/**
 * Validates barcode format
 */
export function isValidPhoneBarcode(barcode: string): boolean {
  return /^PH\d{17}$/.test(barcode);
}
