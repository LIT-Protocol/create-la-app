/**
 * Generates an encrypted Ethereum private key that can only be accessed by a specific Ethereum address.
 *
 * This function:
 * 1. Creates a random Ethereum wallet
 * 2. Sets up access control conditions based on the provided Ethereum address
 * 3. Encrypts the private key using Lit Protocol's encryption
 *
 * The encryption ensures that only the owner of the specified Ethereum address
 * can decrypt and access the private key, providing a secure key management solution.
 *
 * @param accAddress - The Ethereum address that will have permission to decrypt the private key
 * @returns An object containing:
 *   - publicData: Contains the encrypted data (ciphertext), hash, public key, and access conditions
 *   - privateData: Contains the unencrypted private key (for initial storage or use)
 *
 * @example
 * const result = await genEncryptedPrivateKey("0x1234...abcd");
 * // Store publicData on chain or in public storage
 * // Securely handle privateData or discard if not needed
 * 
 {
  publicData: {
    ciphertext: "sRfc9+j3x/ln4/jmYDihjKKxWfixmns6UaFxuZXDV3ivWZt771VEgsjJSYoKB+s708FIb5alHKIeU7D2fc+zZ/z3pQijhnVg8uWlUrbnGBpHyhjkRXozifZKrajX8jpZBRN31VtTocUFyQvR7TlHHuXI6ojaiKxbYP9Lpuc+cSllTPHmJZhiA+W3atQSVa8ly61wtQH0G10C",
    dataToEncryptHash: "1c3d3ffed83ad057d51360e771f56e52e70d86363a159595d1e601a2cb1c5f1d",
    keyType: "K256",
    publicKey: "0x04068c15f31c625a3ca7c8accc9f7d4290dcd2092e44839828d76d3bd69df5f49dc645ad42beea40653defc6ed5459178428f668f1c0ea832f19cab068d4cb368d",
    accs: []
  },
  privateData: {
    privateKey: "0x..."
  }
}
 */
export async function genEncryptedPrivateKey(accAddress: string): Promise<{
  publicData: {
    ciphertext: string;
    dataToEncryptHash: string;
    keyType: "K256";
    publicKey: `0x${string}`;
    accs: any[];
  };
  privateData: {
    privateKey: string;
  };
}> {
  const wallet = ethers.Wallet.createRandom();
  const keypair = {
    privateKey: wallet.privateKey.toString(),
    publicKey: wallet.publicKey,
  };

  const accs = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: accAddress,
      },
    },
  ];

  // -- encrypt the keypair
  const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
    accessControlConditions: accs,
    to_encrypt: new TextEncoder().encode(`lit_${keypair.privateKey}`),
  });

  return {
    publicData: {
      ciphertext,
      dataToEncryptHash,
      keyType: "K256",
      publicKey: keypair.publicKey as `0x${string}`,
      accs,
    },
    privateData: {
      privateKey: keypair.privateKey,
    },
  };
}
