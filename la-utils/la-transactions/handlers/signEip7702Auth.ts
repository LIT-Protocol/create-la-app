import { signAuthorization } from "../primitive/signAuthorization";
import { toEthAddress } from "../../la-pkp/toEthAddress";

/**
 * Handler function for EIP-7702 authorization signing using PKP
 * This function provides a high-level interface for generating EIP-7702 compliant authorization tuples using PKP
 *
 * @param {Object} params - The parameters object
 * @param {string} params.pkpPublicKey - The PKP's public key
 * @param {string} params.targetAddress - The address being authorized
 * @param {string|number} params.chainId - The chain ID (0 for universal deployment)
 * @param {string|number} params.nonce - Optional nonce value (defaults to 0 for new accounts)
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
export const signEip7702Auth = async ({
  pkpPublicKey,
  targetAddress,
  chainId = 0,
  nonce = 0,
}: {
  pkpPublicKey: string;
  targetAddress: string;
  chainId?: string | number;
  nonce?: string | number;
}) => {
  // Get the signer's address from PKP
  const signerAddress = toEthAddress(pkpPublicKey);

  // Generate the authorization tuple
  const authTuple = await signAuthorization({
    sigName: "eip7702-auth",
    pkpPublicKey,
    chainId,
    target: targetAddress,
    nonce,
  });

  // Return authorization tuple with signer address
  return {
    ...authTuple,
    signer: signerAddress,
  };
};
