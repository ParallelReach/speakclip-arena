const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function randomId(len = 10): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return out;
}

export function duoCode(): string {
  return randomId(6);
}
