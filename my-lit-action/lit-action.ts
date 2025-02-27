import { getYellowstoneProvider } from "../la-utils/la-chain/yellowstone/getYellowstoneProvider";
import { toEthAddress } from "../la-utils/la-pkp/toEthAddress";
import { contractCall } from "../la-utils/la-transactions/handlers/contractCall";
import { nativeSend } from "../la-utils/la-transactions/handlers/nativeSend";
import { signEip7702Auth } from "../la-utils/la-transactions/handlers/signEip7702Auth";
import { contractExample } from "./contract-example";
import { composeTxUrl } from "./utils";

// Define your jsParams here. It's sending from ./my-app/main.ts
declare global {
  var params: {
    pkpPublicKey: string;
  };
}

(async () => {
  console.log("🔐 EIP-7702 Authorization Example");

  try {
    // Generate the EIP-7702 authorization tuple
    const authTuple = await signEip7702Auth({
      pkpPublicKey: params.pkpPublicKey,
      targetAddress: "0x341E5273E2E2ea3c4aDa4101F008b1261E58510D",
      chainId: 1,
    });

    console.log("✅ Authorization signed successfully!");
    console.log("authTuple:", authTuple);
  } catch (error) {
    console.error("❌ Failed to sign authorization:", error);
  }

  // Access your jsParams here
  // console.log("PKP Public Key:", params.pkpPublicKey);

  // // using a helper function
  // const pkpEthAddress = toEthAddress(params.pkpPublicKey);
  // console.log("PKP ETH Address:", pkpEthAddress);

  // // Get the provider
  // const provider = await getYellowstoneProvider();

  // // Example 1: Send transaction using the nativeSend handler, which is a wrapper around the primitive functions
  // const txHash = await nativeSend({
  //   provider,
  //   pkpPublicKey: params.pkpPublicKey,
  //   to: pkpEthAddress,
  //   amount: "0.0001",
  // });

  // // Example 2: Call a contract function
  // const txHash2 = await contractCall({
  //   provider,
  //   pkpPublicKey: params.pkpPublicKey,
  //   callerAddress: pkpEthAddress,
  //   abi: [contractExample.methods.mintNextAndAddAuthMethods],
  //   contractAddress: contractExample.address,
  //   functionName: "mintNextAndAddAuthMethods",
  //   args: [
  //     2,
  //     [2],
  //     ["0x170d13600caea2933912f39a0334eca3d22e472be203f937c4bad0213d92ed71"],
  //     ["0x0000000000000000000000000000000000000000000000000000000000000000"],
  //     [[1]],
  //     true,
  //     true,
  //   ],
  //   overrides: {
  //     value: 1n,
  //   },
  // });

  // console.log(`🎉 [nativeSend] Transaction sent: ${composeTxUrl(txHash)}`);
  // console.log(`🎉 [contractCall] Transaction sent: ${composeTxUrl(txHash2)}`);
})();
