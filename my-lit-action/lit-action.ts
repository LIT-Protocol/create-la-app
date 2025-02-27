import { getYellowstoneProvider } from "../la-utils/la-chain/yellowstone/getYellowstoneProvider";
import { toEthAddress } from "../la-utils/la-pkp/toEthAddress";
import { contractCall } from "../la-utils/la-transactions/handlers/contractCall";
import { nativeSend } from "../la-utils/la-transactions/handlers/nativeSend";
import { signEip7702Auth } from "../la-utils/la-transactions/handlers/signEip7702Auth";
import { signEip7702AuthViem } from "../la-utils/la-transactions/handlers/signEip7702AuthViem";
import { contractExample } from "./contract-example";
import { composeTxUrl } from "./utils";
import { type Hex } from "viem";

// Define your jsParams here. It's sending from ./my-app/main.ts
declare global {
  var params: {
    pkpPublicKey: string;
  };
}

const TARGET_ADDRESS = "0x341E5273E2E2ea3c4aDa4101F008b1261E58510D";

(async () => {
  console.log("🔐 EIP-7702 Authorization Examples");

  // Example 1: Using PKP to sign EIP-7702 authorization
  try {
    // Generate the EIP-7702 authorization tuple using PKP
    const authTuple = await signEip7702Auth({
      pkpPublicKey: params.pkpPublicKey,
      targetAddress: TARGET_ADDRESS,
      chainId: 1,
    });

    console.log("✅ PKP Authorization tuple generated successfully!");
    console.log("authTuple:", authTuple);
  } catch (error) {
    console.error("❌ Failed to sign PKP authorization:", error);
  }

  // Example 2: Using Viem with private key to sign EIP-7702 authorization
  try {
    const privateKey =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as Hex; // Example private key

    const signature = await signEip7702AuthViem({
      privateKey,
      targetAddress: TARGET_ADDRESS,
      chainId: 1n,
      nonce: 0n,
    });

    console.log("✅ Private key Authorization tuple generated:", signature);
  } catch (error) {
    console.error("❌ Failed to sign with Viem:", error);
  }
})();
