// Utility for Zero Knowledge Client-Side Encryption using Web Crypto API

// Helper to convert ArrayBuffer to Base64
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive a Master Key from the user's password
export async function deriveMasterKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Use a static salt for simplicity in this prototype.
  // In production, each user should have a unique salt stored in DB.
  const salt = enc.encode('zk-vault-static-salt-2024');

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate a random AES-GCM file key
export async function generateFileKey() {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt the File Key using the Master Key
export async function encryptFileKey(fileKey, masterKey) {
  const rawFileKey = await window.crypto.subtle.exportKey('raw', fileKey);
  const keyIV = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: keyIV,
    },
    masterKey,
    rawFileKey
  );

  return {
    encryptedKeyBase64: bufferToBase64(encryptedKeyBuffer),
    keyIVBase64: bufferToBase64(keyIV),
  };
}

// Decrypt the File Key using the Master Key
export async function decryptFileKey(encryptedKeyBase64, keyIVBase64, masterKey) {
  const encryptedKeyBuffer = base64ToBuffer(encryptedKeyBase64);
  const keyIV = new Uint8Array(base64ToBuffer(keyIVBase64));

  const rawFileKey = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: keyIV,
    },
    masterKey,
    encryptedKeyBuffer
  );

  return window.crypto.subtle.importKey(
    'raw',
    rawFileKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt File Data
export async function encryptFileData(fileBuffer, fileKey) {
  const fileIV = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: fileIV,
    },
    fileKey,
    fileBuffer
  );

  return {
    encryptedBlob: new Blob([encryptedBuffer]),
    fileIVBase64: bufferToBase64(fileIV),
  };
}

// Decrypt File Data
export async function decryptFileData(encryptedBuffer, fileIVBase64, fileKey) {
  const fileIV = new Uint8Array(base64ToBuffer(fileIVBase64));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: fileIV,
    },
    fileKey,
    encryptedBuffer
  );

  return decryptedBuffer;
}

// --- RSA PKI Additions ---

// Generate RSA-OAEP Key Pair for the user
export async function generateRSAKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKeyBase64: bufferToBase64(publicKeyBuffer),
    privateKeyBase64: bufferToBase64(privateKeyBuffer), // Note: needs to be encrypted before sending to server
    keyPair
  };
}

// Encrypt a String (like a base64 private key) using AES-GCM and Master Key
export async function encryptStringAES(plainText, masterKey) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    masterKey,
    enc.encode(plainText)
  );

  return {
    encryptedBase64: bufferToBase64(encryptedBuffer),
    ivBase64: bufferToBase64(iv),
  };
}

// Decrypt a String using AES-GCM and Master Key
export async function decryptStringAES(encryptedBase64, ivBase64, masterKey) {
  const encryptedBuffer = base64ToBuffer(encryptedBase64);
  const iv = new Uint8Array(base64ToBuffer(ivBase64));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    masterKey,
    encryptedBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

// Encrypt AES File Key using an RSA Public Key
export async function encryptAESKeyWithRSA(aesFileKey, rsaPublicKeyBase64) {
  const rawFileKey = await window.crypto.subtle.exportKey('raw', aesFileKey);
  const publicKeyBuffer = base64ToBuffer(rsaPublicKeyBase64);

  const rsaPublicKey = await window.crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    rsaPublicKey,
    rawFileKey
  );

  return bufferToBase64(encryptedBuffer);
}

// Decrypt AES File Key using an RSA Private Key
export async function decryptAESKeyWithRSA(encryptedAESKeyBase64, rsaPrivateKeyBase64) {
  const encryptedBuffer = base64ToBuffer(encryptedAESKeyBase64);
  const privateKeyBuffer = base64ToBuffer(rsaPrivateKeyBase64);

  const rsaPrivateKey = await window.crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );

  const rawFileKey = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    rsaPrivateKey,
    encryptedBuffer
  );

  return window.crypto.subtle.importKey(
    'raw',
    rawFileKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}
