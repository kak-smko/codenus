export class Crypto {
  constructor(sharedKey = null) {
    this.curve = 'P-256'
    this.aesAlgorithm = 'AES-GCM'
    this.serverPublicKey = null
    this.clientKeyPair = null
    this.sharedKey = sharedKey
  }


  async init(serverPublicKeyPem) {
    this.serverPublicKey = await this.importPublicKey(serverPublicKeyPem)

    this.clientKeyPair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: this.curve },
      true,
      ['deriveBits']
    )

    const sharedSecret = await crypto.subtle.deriveBits(
      {
        name: 'ECDH',
        public: this.serverPublicKey
      },
      this.clientKeyPair.privateKey,
      256
    )

    const hash = await crypto.subtle.digest('SHA-256', sharedSecret)

    this.sharedKey = await crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    )

    const exported = await crypto.subtle.exportKey(
      'spki',
      this.clientKeyPair.publicKey
    )

    return this.arrayBufferToBase64(exported)
  }


  async encrypt(data) {
    if (!this.sharedKey) {
      throw new Error('shared_key_not_set')
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: this.aesAlgorithm,
        iv: iv
      },
      this.sharedKey,
      data
    )

    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.byteLength)

    return combined
  }

  async encrypt_text(data) {
    const enc = new TextEncoder()

    return this.arrayBufferToBase64(await this.encrypt(enc.encode(data)))
  }


  async decrypt(encrypted) {
    if (!this.sharedKey) {
      throw new Error('shared_key_not_set')
    }

    const iv = encrypted.slice(0, 12)
    const ciphertext = encrypted.slice(12)

    return await window.crypto.subtle.decrypt(
      {
        name: this.aesAlgorithm,
        iv: iv
      },
      this.sharedKey,
      ciphertext
    )

  }

  async decrypt_text(encryptedBase64) {

    const combined = this.base64ToArrayBuffer(encryptedBase64)

    const decrypted = await this.decrypt(combined)

    const dec = new TextDecoder()
    return JSON.parse(dec.decode(decrypted))
  }


  async importPublicKey(pemKey) {
    const pemHeader = '-----BEGIN PUBLIC KEY-----'
    const pemFooter = '-----END PUBLIC KEY-----'
    const pemContents = pemKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '')

    const binaryDer = this.base64ToArrayBuffer(pemContents)

    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'ECDH',
        namedCurve: this.curve
      },
      true,
      []
    )
  }

  // Helper Functions
  arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  base64ToArrayBuffer(base64) {
    const binary = window.atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
}
