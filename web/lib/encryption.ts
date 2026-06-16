import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getEnv } from "@/config/env";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY_BYTES = 32;
const ENCRYPTION_KEY_HEX_LENGTH = ENCRYPTION_KEY_BYTES * 2;
const INITIALIZATION_VECTOR_BYTES = 16;
const AUTHENTICATION_TAG_BYTES = 16;
const ENCRYPTED_PARTS = 3;
const ENCRYPTED_VALUE_SEPARATOR = ":";
const HEX_PATTERN = /^[0-9a-f]+$/i;
const UTF8_ENCODING = "utf8";
const BASE64_ENCODING = "base64";

function getEncryptionKeyBuffer() {
  const encryptionKey = getEnv().ENCRYPTION_KEY;

  if (encryptionKey.length !== ENCRYPTION_KEY_HEX_LENGTH) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string.");
  }

  if (!HEX_PATTERN.test(encryptionKey)) {
    throw new Error("ENCRYPTION_KEY must only contain hexadecimal characters.");
  }

  return Buffer.from(encryptionKey, "hex");
}

function encodePart(value: Buffer) {
  return value.toString(BASE64_ENCODING);
}

function decodePart(value: string, label: string) {
  if (!value) {
    throw new Error(`Encrypted payload is missing the ${label}.`);
  }

  return Buffer.from(value, BASE64_ENCODING);
}

function parseEncryptedValue(ciphertext: string) {
  const parts = ciphertext.split(ENCRYPTED_VALUE_SEPARATOR);

  if (parts.length !== ENCRYPTED_PARTS) {
    throw new Error("Encrypted payload is malformed.");
  }

  const [iv, authTag, encryptedContent] = parts;

  return {
    iv: decodePart(iv, "initialization vector"),
    authTag: decodePart(authTag, "authentication tag"),
    encryptedContent: decodePart(encryptedContent, "ciphertext"),
  };
}

function validateBufferLength(value: Buffer, expectedLength: number, label: string) {
  if (value.length !== expectedLength) {
    throw new Error(`Encrypted payload has an invalid ${label}.`);
  }
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKeyBuffer();
  const iv = randomBytes(INITIALIZATION_VECTOR_BYTES);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encryptedBuffer = Buffer.concat([
    cipher.update(plaintext, UTF8_ENCODING),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encryptedBuffer]
    .map(encodePart)
    .join(ENCRYPTED_VALUE_SEPARATOR);
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKeyBuffer();
  const encryptedValue = parseEncryptedValue(ciphertext);

  validateBufferLength(
    encryptedValue.iv,
    INITIALIZATION_VECTOR_BYTES,
    "initialization vector",
  );
  validateBufferLength(
    encryptedValue.authTag,
    AUTHENTICATION_TAG_BYTES,
    "authentication tag",
  );

  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    encryptedValue.iv,
  );
  decipher.setAuthTag(encryptedValue.authTag);

  return Buffer.concat([
    decipher.update(encryptedValue.encryptedContent),
    decipher.final(),
  ]).toString(UTF8_ENCODING);
}
