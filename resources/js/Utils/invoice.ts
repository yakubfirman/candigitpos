export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const date = `${year}${month}${day}`;
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${date}-${rand}`;
}