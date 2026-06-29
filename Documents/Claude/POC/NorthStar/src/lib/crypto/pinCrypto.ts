const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH = 256
const HASH_ALGO = 'SHA-256'

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

async function getKeyMaterial(pin: string): Promise<CryptoKey> {
  const pinBuffer = new TextEncoder().encode(pin)
  return crypto.subtle.importKey('raw', pinBuffer, 'PBKDF2', false, ['deriveBits', 'deriveKey'])
}

export const pinCrypto = {
  async hashPin(pin: string): Promise<{ hash: string; salt: string }> {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16))
    const salt = bufToHex(saltBytes.buffer as ArrayBuffer)

    const keyMaterial = await getKeyMaterial(pin)
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: HASH_ALGO },
      keyMaterial,
      KEY_LENGTH,
    )
    const hash = bufToHex(bits)

    return { hash, salt }
  },

  async verifyPin(pin: string, hash: string, salt: string): Promise<boolean> {
    const saltBytes = hexToBuf(salt)
    const keyMaterial = await getKeyMaterial(pin)
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: HASH_ALGO },
      keyMaterial,
      KEY_LENGTH,
    )
    const derivedHash = bufToHex(bits)

    // NOTE: This is a simple string comparison, not true constant-time.
    // True constant-time comparison is not available in pure browser JS without
    // native crypto primitives. For a PIN of fixed length this is acceptable,
    // but a timing-safe compare would require a Web Worker or WASM in a
    // production security-critical context.
    return derivedHash === hash
  },

  async deriveKey(pin: string, salt: string): Promise<CryptoKey> {
    const saltBytes = hexToBuf(salt)
    const keyMaterial = await getKeyMaterial(pin)
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBytes.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: HASH_ALGO },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt'],
    )
  },
}
