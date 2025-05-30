import { bytesToUtf8 } from '@noble/ciphers/utils'
import { base58 } from '@scure/base'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Default derivation path for key generation
// eslint-disable-next-line quotes
export const DEFAULT_DERIVATION_PATH = "m/44'/0'/0'/0/0"

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface Base58ValidationResult {
  isValid: boolean
  error?: string
  pubKeyBytes?: Uint8Array
}

/**
 * Validates a Base58 encoded public key
 * @param key - Base58 encoded public key string
 * @returns Validation result containing validity status, error message, and decoded bytes
 */
export function validateBase58PublicKey(key: string): Base58ValidationResult {
  // Input validation
  if (!key || typeof key !== 'string') {
    return { isValid: false, error: 'Public key must be a non-empty string' }
  }

  // Trim whitespace
  const trimmedKey = key.trim()
  if (!trimmedKey) {
    return { isValid: false, error: 'Public key cannot be empty or whitespace only' }
  }

  // Check length range (Base58 encoded 33 bytes typically 44-50 characters)
  if (trimmedKey.length < 40 || trimmedKey.length > 60) {
    return { isValid: false, error: 'Invalid public key length. Expected Base58 encoded string length between 40-60 characters' }
  }

  // Check if it matches Base58 character set (Bitcoin Base58 charset)
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmedKey)) {
    return { isValid: false, error: 'Invalid public key format. Must contain only Base58 characters (excluding 0, O, I, l)' }
  }

  try {
    const pubKeyBytes = base58.decode(trimmedKey)

    // Check decoded length
    // 33 bytes: compressed format public key
    // 65 bytes: uncompressed format public key  
    if (pubKeyBytes.length !== 33 && pubKeyBytes.length !== 65) {
      return {
        isValid: false,
        error: `Invalid public key length. Expected 33 bytes (compressed) or 65 bytes (uncompressed), got ${pubKeyBytes.length} bytes`
      }
    }

    // Validate compressed format public key prefix
    if (pubKeyBytes.length === 33) {
      const prefix = pubKeyBytes[0]
      if (prefix !== 0x02 && prefix !== 0x03) {
        return {
          isValid: false,
          error: 'Invalid compressed public key prefix. Must start with 0x02 or 0x03'
        }
      }
    }

    // Validate uncompressed format public key prefix
    if (pubKeyBytes.length === 65) {
      const prefix = pubKeyBytes[0]
      if (prefix !== 0x04) {
        return {
          isValid: false,
          error: 'Invalid uncompressed public key prefix. Must start with 0x04'
        }
      }
    }

    return { isValid: true, pubKeyBytes }
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to decode Base58 public key: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export const generateTimestamp = () => +new Date()

export function getFileExtension(filename: string) {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()! : 'txt'
}

export function getFilenameWithoutExtension(filename: string) {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.slice(0, -1).join('.') : filename
}

// Read file as ArrayBuffer
const readFileAsArrayBuffer = (file: File | Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// Identify encryption mode from file
export const identifyEncryptionMode = async (file: File): Promise<'pubk' | 'pwd' | 'unknown'> => {
  try {
    const buffer = await readFileAsArrayBuffer(file.slice(0, 3))
    const data = new Uint8Array(buffer)
    const magicBytes = bytesToUtf8(data)
    if (magicBytes === 'ns0' || magicBytes === 'ns2') {
      return 'pubk'
    } else if (magicBytes === 'ns1') {
      return 'pwd'
    }
    return 'unknown'
  } catch (error) {
    console.error('Error identifying encryption mode:', error)
    return 'unknown'
  }
}
