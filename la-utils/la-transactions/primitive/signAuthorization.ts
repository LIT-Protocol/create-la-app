// Validate inputs according to EIP-7702 spec
/** Maximum value for 256-bit unsigned integers (2^256 - 1)
 * Used to validate:
 * - signature components (r,s)
 * - chainId
 */
const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

/** Maximum value for 64-bit unsigned integers (2^64 - 1)
 * Used to validate:
 * - nonce value
 */
const MAX_UINT64 = BigInt("0xffffffffffffffff");

/** Maximum value for 8-bit unsigned integers (2^8 - 1)
 * Used to validate:
 * - signature yParity (v) value
 */
const MAX_UINT8 = BigInt("0xff");

/**
 * Signs an EIP-7702 authorization tuple
 * This function implements the authorization signing as specified in EIP-7702
 *
 * @param {Object} params - The parameters object
 * @param {string} params.pkpPublicKey - The PKP's public key
 * @param {string|number} params.chainId - The chain ID (0 for universal deployment)
 * @param {string} params.target - The target address that will be authorized
 * @param {string|number} params.nonce - The nonce value (must be < 2^64)
 * @param {string} params.sigName - The name of the signature for tracking
 * @returns {Promise<{chainId: number, address: string, nonce: number, yParity: number, r: string, s: string}>}
 *          The authorization tuple components as specified in EIP-7702
 */
export const signAuthorization = async ({
  sigName,
  pkpPublicKey,
  chainId,
  target,
  nonce,
}: {
  sigName: string;
  pkpPublicKey: string;
  chainId: string | number;
  target: string;
  nonce: string | number;
}) => {
  console.log("=== Debug: Input Parameters ===");
  console.log("pkpPublicKey:", pkpPublicKey);
  console.log("chainId:", chainId);
  console.log("target:", target);
  console.log("nonce:", nonce);

  console.log("\n=== Debug: Max Values ===");
  console.log("MAX_UINT256 (hex):", MAX_UINT256.toString(16));
  console.log("MAX_UINT64 (hex):", MAX_UINT64.toString(16));
  console.log("MAX_UINT8 (hex):", MAX_UINT8.toString(16));

  // Validate chainId
  const numericChainId = BigInt(chainId);
  console.log("numericChainId:", numericChainId);
  if (numericChainId > MAX_UINT256) {
    throw new Error("Chain ID must be less than 2^256");
  }

  // Validate nonce
  const numericNonce = BigInt(nonce);
  console.log("numericNonce:", numericNonce);
  if (numericNonce > MAX_UINT64) {
    throw new Error("Nonce must be less than 2^64");
  }

  // Validate target address
  if (!target.startsWith("0x")) {
    throw new Error("Target address must start with 0x");
  }
  const addressWithoutPrefix = target.slice(2);
  console.log("addressWithoutPrefix:", addressWithoutPrefix);
  if (addressWithoutPrefix.length !== 40) {
    // 20 bytes = 40 hex chars
    throw new Error("Target address must be 20 bytes long");
  }
  if (!/^[0-9a-fA-F]+$/.test(addressWithoutPrefix)) {
    throw new Error("Target address must be a valid hex string");
  }

  // Format the PKP public key if needed
  const pkForLit = pkpPublicKey.startsWith("0x")
    ? pkpPublicKey.slice(2)
    : pkpPublicKey;

  // Create the authorization message according to EIP-7702 spec
  // MAGIC (0x05) || rlp([chain_id, address, nonce])
  const MAGIC = "0x05";
  const rlpEncoded = ethers.utils.RLP.encode([
    ethers.utils.hexlify(chainId),
    target,
    ethers.utils.hexlify(nonce),
  ]);

  console.log("\n=== Debug: Message Construction ===");
  console.log("MAGIC:", MAGIC);
  console.log("RLP encoded:", rlpEncoded);

  const messageToSign = ethers.utils.concat([
    ethers.utils.hexlify(MAGIC),
    rlpEncoded,
  ]);

  console.log("Message to sign:", messageToSign);

  // Hash the message
  const messageHash = ethers.utils.keccak256(messageToSign);
  console.log("Message hash:", messageHash);

  // Sign the hash using PKP
  const sig = await Lit.Actions.signAndCombineEcdsa({
    toSign: ethers.utils.arrayify(messageHash),
    publicKey: pkForLit,
    sigName,
  });

  console.log("\n=== Debug: Raw Signature ===");
  console.log("Raw signature:", sig);

  // Parse signature components
  const parsedSig = JSON.parse(sig);
  console.log("\n=== Debug: Parsed Signature Components ===");
  console.log("v:", parsedSig.v);
  console.log("r:", parsedSig.r);
  console.log("s:", parsedSig.s);

  // Validate signature components
  const yParity = BigInt(parsedSig.v);
  console.log("\n=== Debug: yParity Validation ===");
  console.log("yParity:", yParity.toString());
  console.log("MAX_UINT8:", MAX_UINT8.toString(16));

  if (yParity > MAX_UINT8) {
    throw new Error("y_parity must be less than 2^8");
  }

  // Add hex prefix for BigInt conversion and ensure exactly 64 characters (32 bytes)
  const rHexRaw = parsedSig.r.replace(/^0+/, "");
  const sHexRaw = parsedSig.s.replace(/^0+/, "");

  // Take the last 64 characters to ensure correct length
  const rHex = "0x" + rHexRaw.slice(-64);
  const sHex = "0x" + sHexRaw.slice(-64);

  console.log("\n=== Debug: r/s Hex Values ===");
  console.log("Original r:", parsedSig.r);
  console.log("Truncated rHex:", rHex);
  console.log("Original s:", parsedSig.s);
  console.log("Truncated sHex:", sHex);

  try {
    const r = BigInt(rHex);
    console.log("\n=== Debug: r Value Detailed Comparison ===");
    console.log("r decimal:", r.toString());
    console.log("r hex:", r.toString(16));
    console.log("r length in hex:", r.toString(16).length);
    console.log("MAX_UINT256 decimal:", MAX_UINT256.toString());
    console.log("MAX_UINT256 hex:", MAX_UINT256.toString(16));
    console.log("MAX_UINT256 length in hex:", MAX_UINT256.toString(16).length);
    console.log("Is r > MAX_UINT256?", r > MAX_UINT256);
    console.log("Difference:", (r - MAX_UINT256).toString());

    if (r > MAX_UINT256) {
      throw new Error("r must be less than 2^256");
    }

    const s = BigInt(sHex);
    console.log("\n=== Debug: s Value ===");
    console.log("s decimal:", s.toString());
    console.log("s hex:", s.toString(16));

    if (s > MAX_UINT256) {
      throw new Error("s must be less than 2^256");
    }

    // Additional EIP-2 validation for s value
    const secp256k1n = BigInt(
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"
    );
    console.log("\n=== Debug: secp256k1n Validation ===");
    console.log("secp256k1n/2:", (secp256k1n / BigInt(2)).toString(16));

    if (s > secp256k1n / BigInt(2)) {
      throw new Error(
        "s value must be less than or equal to secp256k1n/2 as per EIP-2"
      );
    }

    // Return the authorization tuple components
    return {
      chainId: Number(chainId),
      address: target,
      nonce: Number(nonce),
      yParity: Number(yParity),
      r: rHex,
      s: sHex,
    };
  } catch (error) {
    console.error("\n=== Debug: Error Details ===");
    console.error("Error converting or validating r/s values:", error);
    throw error;
  }
};
