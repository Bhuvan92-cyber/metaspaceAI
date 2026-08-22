import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get or derive a 32-byte key from the vault secret
 */
function getVaultKey(): Buffer {
  const secret = process.env.TOKEN_VAULT_SECRET || 'metasphere_default_dev_vault_key_32_bytes!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive OAuth token string using AES-256-GCM
 * Returns string format: "ciphertext:iv:authTag" in hex
 */
export function encryptToken(token: string): string {
  if (!token) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getVaultKey(), iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  return `${encrypted}:${iv.toString('hex')}:${authTag}`;
}

/**
 * Decrypts AES-256-GCM encrypted token string
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return '';
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      // In case it's in a mock or raw dev format
      return encryptedData;
    }
    
    const [encryptedHex, ivHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getVaultKey(), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return '[DECRYPTION_ERROR]';
  }
}
