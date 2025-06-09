
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { Buffer } from 'buffer';
import { KeyInfo } from '../types';
import { PRIVATE_KEY_HEX_LENGTH } from '../constants';

// Initialize ECC library
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

function generateRandomBytes(size: number): Buffer {
  const byteArray = new Uint8Array(size);
  window.crypto.getRandomValues(byteArray);
  return Buffer.from(byteArray);
}

export function generateRandomPrivateKeyHex(): string {
  // Generates a 256-bit (32-byte) private key
  const privateKeyBytes = generateRandomBytes(32);
  return privateKeyBytes.toString('hex');
}

export function formatPrivateKey(hexKey: string): string {
  // Remove any non-hex characters
  const cleanedKey = hexKey.replace(/[^0-9a-fA-F]/g, '');
  // Pad with leading zeros if shorter than 64 hex characters
  return cleanedKey.padStart(PRIVATE_KEY_HEX_LENGTH, '0').slice(0, PRIVATE_KEY_HEX_LENGTH);
}

export function isValidPrivateKeyHex(hexKey: string): boolean {
    if (!/^[0-9a-fA-F]+$/.test(hexKey) && hexKey.length > 0) return false; // Contains non-hex if not empty
    if (hexKey.length > PRIVATE_KEY_HEX_LENGTH) return false; // Too long
    // bitcoinjs-lib will further validate if the key is in the valid range
    try {
        const pkBuffer = Buffer.from(formatPrivateKey(hexKey), 'hex');
        if (pkBuffer.length !== 32) return false; // Should be 32 bytes after formatting
        ECPair.fromPrivateKey(pkBuffer); // This will throw if key is invalid (e.g. 0 or >= N)
        return true;
    } catch (e) {
        return false;
    }
}


export function deriveKeyData(privateKeyHex: string): KeyInfo[] {
  const formattedKey = formatPrivateKey(privateKeyHex);
  const privateKeyBuffer = Buffer.from(formattedKey, 'hex');

  if (privateKeyBuffer.length !== 32) {
    throw new Error("Private key must be 32 bytes (64 hex characters).");
  }
  
  let keyPair;
  try {
    keyPair = ECPair.fromPrivateKey(privateKeyBuffer);
  } catch (e) {
    // Catch errors from ECPair (e.g., key out of range)
    throw new Error(`Invalid private key: ${(e as Error).message}`);
  }


  const representations: KeyInfo[] = [];

  representations.push({
    type: 'Private Key (Hex)',
    value: formattedKey,
    isAddress: false,
  });

  // WIF Compressed
  representations.push({
    type: 'WIF (Compressed)',
    value: keyPair.toWIF(),
    isAddress: false,
  });

  // WIF Uncompressed
  const uncompressedKeyPair = ECPair.fromPrivateKey(privateKeyBuffer, { compressed: false });
  representations.push({
    type: 'WIF (Uncompressed)',
    value: uncompressedKeyPair.toWIF(),
    isAddress: false,
  });

  const { publicKey: compressedPublicKey } = keyPair; // compressed by default
  const { publicKey: uncompressedPublicKey } = uncompressedKeyPair;

  // P2PKH (Compressed)
  const p2pkhCompressed = bitcoin.payments.p2pkh({ pubkey: compressedPublicKey, network: bitcoin.networks.bitcoin });
  if (p2pkhCompressed.address) {
    representations.push({ type: 'P2PKH (Base58, Compressed)', value: p2pkhCompressed.address, isAddress: true, address: p2pkhCompressed.address });
  }

  // P2PKH (Uncompressed)
  const p2pkhUncompressed = bitcoin.payments.p2pkh({ pubkey: uncompressedPublicKey, network: bitcoin.networks.bitcoin });
  if (p2pkhUncompressed.address) {
    representations.push({ type: 'P2PKH (Base58, Uncompressed)', value: p2pkhUncompressed.address, isAddress: true, address: p2pkhUncompressed.address });
  }
  
  // P2WPKH (SegWit)
  const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: compressedPublicKey, network: bitcoin.networks.bitcoin });
  if (p2wpkh.address) {
    representations.push({ type: 'P2WPKH (Bech32)', value: p2wpkh.address, isAddress: true, address: p2wpkh.address });
  }

  // P2SH-P2WPKH (SegWit compatibility)
  const p2sh_p2wpkh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: bitcoin.networks.bitcoin });
  if (p2sh_p2wpkh.address) {
    representations.push({ type: 'P2SH-P2WPKH (Base58)', value: p2sh_p2wpkh.address, isAddress: true, address: p2sh_p2wpkh.address });
  }
  
  // P2TR (Taproot)
  // For P2TR, internalPubkey is the x-only public key.
  const xOnlyPublicKey = compressedPublicKey.subarray(1, 33); // Get the x-coordinate (32 bytes)
  const p2tr = bitcoin.payments.p2tr({ internalPubkey: xOnlyPublicKey, network: bitcoin.networks.bitcoin });
  if (p2tr.address) {
    representations.push({ type: 'P2TR (Bech32m)', value: p2tr.address, isAddress: true, address: p2tr.address });
  }

  return representations;
}
