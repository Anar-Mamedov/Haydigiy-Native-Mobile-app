/**
 * RFC4122-style v4 UUID. Used only as a non-security correlation id in the
 * Hepsijet pickup payload — each send must carry a unique `companyAddressId`
 * and `companyCustomerId` or the courier API reuses a cached address. Prefers
 * the platform crypto implementation when one is available.
 */
export function uuidv4(): string {
  const platformCrypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (typeof platformCrypto?.randomUUID === 'function') {
    return platformCrypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
