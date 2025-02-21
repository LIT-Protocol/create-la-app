import { yellowstoneConfig } from "../../la-chain/yellowstone/yellowstoneConfig";
import { signTx } from "../primitive/signTx";
import { sendTx } from "../primitive/sendTx";

/**
 * Handler function for making contract calls
 * This function handles the preparation, signing, and sending of contract transactions
 * 
 * @param provider - The network provider instance
 * @param pkpPublicKey - The PKP public key for transaction signing
 * @param pkpEthAddress - The ethereum address derived from PKP
 * @param abi - The ABI of the contract function
 * @param address - The contract address
 * @param functionName - The name of the function to call
 * @param args - The arguments to pass to the function
 * @param overrides - Optional transaction overrides (value, gasLimit)
 * @returns The transaction hash
 */
export const contractCall = async ({
  provider,
  pkpPublicKey,
  callerAddress,
  abi,
  contractAddress,
  functionName,
  args,
  overrides = {},
}: {
  provider: any;
  pkpPublicKey: string;
  callerAddress: string;
  abi: any[];
  contractAddress: string;
  functionName: string;
  args: any[];
  overrides?: {
    value?: string | number | bigint;
    gasLimit?: number;
  };
}) => {
  // Step 1: Encode function data using ethers Interface
  const iface = new ethers.utils.Interface(abi);
  const encodedData = iface.encodeFunctionData(functionName, args);
  const fromAddress = callerAddress;

  console.log("Encoded data:", encodedData);

  // Convert value override if exists to BigNumber
  const txValue = overrides.value
    ? ethers.BigNumber.from(overrides.value.toString())
    : ethers.BigNumber.from(0);

  // Step 2: Estimate gas using the provider
  const estimatedGas = await provider.estimateGas({
    from: fromAddress,
    to: contractAddress,
    data: encodedData,
    value: txValue,
  });

  console.log("Estimated gas:", estimatedGas);

  // If overrides include a custom gas, use it instead of adjustedGas.
  // Note: ethers uses 'gasLimit' instead of 'gas'.
  const gasLimit = overrides.gasLimit
    ? ethers.BigNumber.from(overrides.gasLimit.toString())
    : estimatedGas;

  console.log("Gas limit:", gasLimit);

  const nonce = await provider.getTransactionCount(callerAddress);
  const gasPrice = await provider.getGasPrice();
  console.log("Gas price:", gasPrice.toString());

  // Craft the transaction object
  const tx = {
    to: contractAddress,
    data: encodedData,
    value: txValue,
    gasLimit: gasLimit,
    gasPrice: gasPrice,
    nonce: nonce,
    chainId: yellowstoneConfig.id,
  };

  console.log("Transaction:", tx);

  // Step 3: Sign the transaction
  const signedTx = await signTx({
    sigName: functionName,
    pkpPublicKey: pkpPublicKey,
    tx,
  });
  console.log("Signed transaction:", signedTx);

  // Step 4: Send the transaction
  const txHash = await sendTx(provider, signedTx);
  console.log("Transaction sent:", txHash);
  return txHash;
};
