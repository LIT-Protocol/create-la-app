import { handleDB } from "./src/handleDB";
import { genEncryptedPrivateKey } from "../../la-account/getEthPrivateKey";
import { hexPrefixed } from "../../la-utils/la-transformer";

/**
 * API constants and configuration
 */
const LIT_ACTION_NAME = "db-bro";
const DEFAULT_MESSAGE = "HAKUNA MATATA";

/**
 * ========== Types ==========
 */
/**
 * Interface for action parameters
 */
interface BaseParams {
  action: "register" | "read" | "use";
  pkpPublicKey: string;
}

interface UseParams extends BaseParams {
  action: "use";
  address: string;
  customMessage?: string;
}

/**
 * Registers a new encrypted private key in the database.
 *
 * This function:
 * 1. Computes the PKP owner address from the public key
 * 2. Generates an encrypted private key with access control set to the PKP address
 * 3. Stores the metadata in OrbisDB
 *
 * @param pkpPublicKey - The public key of the PKP that will own the encrypted key
 * @returns Object containing the database ID, public data, and owner address
 */
async function register(pkpPublicKey: string) {
  pkpPublicKey = hexPrefixed(pkpPublicKey);

  // The PKP owns the encrypted private key
  const privateKeyOwnerAddress = ethers.utils.computeAddress(pkpPublicKey);

  // The PKP address is set as the access control condition
  const { publicData, privateData } = await genEncryptedPrivateKey(
    privateKeyOwnerAddress
  );

  // We then write to the OrbisDB table in the columns 'owner' and 'metadata'.
  const { id } = await handleDB({
    privateKey: privateData.privateKey,
    action: "write",
    data: {
      ownerAddress: privateKeyOwnerAddress,
      metadata: JSON.stringify(publicData),
    },
  });

  return {
    id,
    publicData,
    ownerAddress: privateKeyOwnerAddress,
  };
}

/**
 * Retrieves all stored metadata for the PKP.
 *
 * @param pkpPublicKey - The public key of the PKP
 * @returns Array of metadata objects from the database
 */
async function read(pkpPublicKey: string) {
  pkpPublicKey = hexPrefixed(pkpPublicKey);
  const privateKeyOwnerAddress = ethers.utils.computeAddress(pkpPublicKey);
  const wallet = ethers.Wallet.createRandom();

  const res = await handleDB({
    privateKey: wallet.privateKey.toString(),
    action: "read",
    data: {
      ownerAddress: privateKeyOwnerAddress,
    },
  });

  const allMetadata = res.rows.map((row) => {
    const metadata = JSON.parse(row.metadata);
    return {
      ...metadata,
      address: ethers.utils.computeAddress(metadata.publicKey),
    };
  });

  return allMetadata;
}

/**
 * Uses a stored private key to sign a message.
 *
 * This function:
 * 1. Retrieves the metadata for the PKP
 * 2. Finds the specified address in the metadata
 * 3. Decrypts the private key using Lit Protocol
 * 4. Signs a message with the decrypted key
 *
 * @param params - Parameters including pkpPublicKey, address to use, and optional custom message
 * @returns Object containing the address, signature, and signed message
 */
async function use(params: UseParams) {
  params.pkpPublicKey = hexPrefixed(params.pkpPublicKey);
  const allMetadata = await read(params.pkpPublicKey);
  const selectedMetadata = allMetadata.find(
    (metadata) => metadata.address === params.address
  );

  if (!selectedMetadata) {
    throw new Error(`No metadata found for address ${params.address}`);
  }

  const decryptRes = await Lit.Actions.decryptAndCombine({
    accessControlConditions: selectedMetadata.accs,
    ciphertext: selectedMetadata.ciphertext,
    dataToEncryptHash: selectedMetadata.dataToEncryptHash,
    chain: "ethereum",
    authSig: null as unknown as string, // <-- Signed by the PKP on Lit Action, that's why is null.
  });

  const privateKey = decryptRes.replace("lit_", "");
  const wallet = new ethers.Wallet(privateKey);
  const signedMessage = params.customMessage || DEFAULT_MESSAGE;
  const signature = await wallet.signMessage(signedMessage);

  return {
    address: wallet.address,
    signature,
    signedMessage,
  };
}

/**
 * Main API function that handles all operations (register, read, use) through Lit Actions.
 *
 * This function determines which action to perform based on the params.action field,
 * delegates to the appropriate specialized function, and wraps everything in a Lit.Actions.runOnce call.
 *
 * @param params - Parameters for the action including action type and PKP public key
 * @returns Result of the action
 */
async function runOrbisAction(params: BaseParams | UseParams) {
  const res = await Lit.Actions.runOnce(
    {
      waitForResponse: true,
      name: LIT_ACTION_NAME,
    },
    async () => {
      try {
        let result;

        switch (params.action) {
          case "register":
            result = await register(params.pkpPublicKey);
            break;

          case "read":
            result = await read(params.pkpPublicKey);
            break;

          case "use":
            result = await use(params as UseParams);
            break;

          default:
            throw new Error(`Unknown action: ${(params as any).action}`);
        }

        return JSON.stringify({
          success: true,
          message: result,
        });
      } catch (error: unknown) {
        return JSON.stringify({
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }
  );

  return JSON.parse(res);
}

export const orbisAPI = {
  entries: (pubkey: string) =>
    runOrbisAction({ action: "read", pkpPublicKey: pubkey }),
  register: (pubkey: string) =>
    runOrbisAction({ action: "register", pkpPublicKey: pubkey }),
  use: (params: UseParams) => runOrbisAction(params),
};
