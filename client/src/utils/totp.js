// RFC 6238 TOTP Implementation using standard Web Crypto API
// Compatible with Google Authenticator, Microsoft Authenticator, Authy, 1Password
import QRCode from 'qrcode';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate random Base32 secret key (16 characters / 80-bit standard TOTP)
export function generateBase32Secret(length = 16) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
  }
  return secret;
}

// Decode Base32 string to Uint8Array
export function base32Decode(str) {
  const cleaned = (str || '').toUpperCase().replace(/[\s=-]/g, '');
  let bits = '';
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) throw new Error(`Invalid Base32 character: ${cleaned[i]}`);
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

// Generate TOTP code for a given counter step
export async function generateTOTPCode(secret, counter) {
  const keyBytes = base32Decode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setBigUint64(0, BigInt(counter), false);

  const sig = await crypto.subtle.sign('HMAC', cryptoKey, buf);
  const hmac = new Uint8Array(sig);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

// Verify a 6-digit TOTP code against a secret (with +/- 1 step / 30s window drift allowance)
export async function verifyTOTPCode(token, secret, window = 1) {
  if (!token || !secret) return false;
  const cleanedToken = token.toString().trim().replace(/\s+/g, '');
  if (cleanedToken.length !== 6) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let i = -window; i <= window; i++) {
    const code = await generateTOTPCode(secret, currentStep + i);
    if (code === cleanedToken) {
      return true;
    }
  }
  return false;
}

// Generate the standard otpauth URL for Google Authenticator
export function getOtpAuthUrl(email, secret, issuer = 'StudentExpenseTracker') {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// Generate QR Code data URL from otpauth URL
export async function generateQRCodeDataUrl(otpauthUrl) {
  return QRCode.toDataURL(otpauthUrl, {
    margin: 2,
    width: 240,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff'
    }
  });
}
