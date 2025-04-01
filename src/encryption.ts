import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || '4e6f742061207265616c206b6579206275742069747320333220627974657321',
  'hex'
);

/**
 * Encrypts the given data using AES-256-CBC.
 * @param data - The data to encrypt.
 * @returns The encrypted data in hexadecimal format, prefixed with the IV.
 */
export function encrypt(data: string): string {
  const IV = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return IV.toString('hex') + ':' + encrypted; // Prepend IV for use in decryption
}

/**
 * Decrypts the given data using AES-256-CBC.
 * @param encryptedData - The encrypted data in hexadecimal format, prefixed with the IV.
 * @returns The decrypted data as a string.
 */
export function decrypt(encryptedData: string): string {
  const [ivHex, encryptedHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}