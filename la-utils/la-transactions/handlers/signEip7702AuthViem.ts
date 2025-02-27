import { concatHex, encodeAbiParameters, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Signs an EIP-7702 authorization using a private key via Viem
 * This function provides a direct interface to sign EIP-7702 authorizations using Viem's primitives and a private key
 * 
 * @param {Object} params - The parameters object
 * @param {Hex} params.privateKey - The private key to sign with (must be in 0x format)
 * @param {string} params.targetAddress - The address being authorized
 * @param {bigint} params.chainId - The chain ID (defaults to 1n for Ethereum mainnet)
 * @param {bigint} params.nonce - The nonce value (defaults to 0n)
 * @returns {Promise<{
 *   chainId: number,
 *   address: string,
 *   nonce: number,
 *   yParity: number,
 *   r: string,
 *   s: string,
 *   signer: string
 * }>} The authorization tuple components and signer address
 */
export const signEip7702AuthViem = async ({
  privateKey,
  targetAddress,
  chainId = 1n,
  nonce = 0n,
}: {
  privateKey: Hex;
  targetAddress: string;
  chainId?: bigint;
  nonce?: bigint;
}) => {
  const wallet = privateKeyToAccount(privateKey);

  const message = {
    chainId,
    target: targetAddress as Hex,
    nonce,
  };

  // Sign using Viem's signMessage with EIP-7702 format
  const signature = await wallet.signMessage({
    message: concatHex([
      "0x05", // MAGIC prefix for EIP-7702
      encodeAbiParameters(
        [{ type: "uint256" }, { type: "address" }, { type: "uint64" }],
        [message.chainId, message.target, message.nonce]
      ),
    ]),
  });

  // Extract r, s, v components from the signature
  const r = `0x${signature.slice(2, 66)}`;
  const s = `0x${signature.slice(66, 130)}`;
  const v = parseInt(signature.slice(130, 132), 16);

  // Return in the same format as PKP auth tuple
  return {
    chainId: Number(chainId),
    address: targetAddress,
    nonce: Number(nonce),
    yParity: v - 27, // Convert v to yParity
    r,
    s,
    signer: wallet.address
  };
}; 