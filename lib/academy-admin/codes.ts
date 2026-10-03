/** Enrollment code format: PREFIX-XXXX-XXXX, without look-alike characters (0/O, 1/I). */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeCode(prefix: string, random: () => number) {
  const block = () => Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]).join("");
  return `${prefix}-${block()}-${block()}`;
}

export const codePrefix = (slug: string) => slug.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X");
