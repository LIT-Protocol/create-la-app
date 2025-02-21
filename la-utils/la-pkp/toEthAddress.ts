/**
 * Converts a PKP string to a checksummed Ethereum address
 * @param pkpPublicKey - The PKP string to convert
 * @returns A checksummed Ethereum address
 */
export function toEthAddress(pkpPublicKey: string) {
  if (!pkpPublicKey.startsWith("0x")) {
    pkpPublicKey = `0x${pkpPublicKey}`;
  }

  return ethers.utils.computeAddress(pkpPublicKey);
}
