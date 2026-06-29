import { describe, it, expect } from 'vitest'
import { pinCrypto } from '@/lib/crypto/pinCrypto'

describe('pinCrypto', () => {
  it('hashPin returns a hash and salt', async () => {
    const { hash, salt } = await pinCrypto.hashPin('1234')
    expect(hash).toBeTruthy()
    expect(salt).toBeTruthy()
    expect(hash.length).toBeGreaterThan(10)
    expect(salt.length).toBeGreaterThan(10)
  })

  it('verifyPin returns true for correct PIN', async () => {
    const { hash, salt } = await pinCrypto.hashPin('1234')
    const result = await pinCrypto.verifyPin('1234', hash, salt)
    expect(result).toBe(true)
  })

  it('verifyPin returns false for wrong PIN', async () => {
    const { hash, salt } = await pinCrypto.hashPin('1234')
    const result = await pinCrypto.verifyPin('9999', hash, salt)
    expect(result).toBe(false)
  })

  it('same PIN produces different hashes (different salts)', async () => {
    const a = await pinCrypto.hashPin('1234')
    const b = await pinCrypto.hashPin('1234')
    expect(a.hash).not.toBe(b.hash)
    expect(a.salt).not.toBe(b.salt)
  })

  it('deriveKey returns a CryptoKey', async () => {
    const { salt } = await pinCrypto.hashPin('1234')
    const key = await pinCrypto.deriveKey('1234', salt)
    expect(key).toBeTruthy()
    expect(key.type).toBe('secret')
  })
})
