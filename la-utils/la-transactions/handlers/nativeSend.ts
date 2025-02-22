import { signTx } from "../primitive/signTx";
import { sendTx } from "../primitive/sendTx";
import { toEthAddress } from "../../la-pkp/toEthAddress";

/**
 * Handler function for sending native tokens on the network
 * This function handles the preparation, signing, and sending of native token transactions
 *
 * @param provider - The network provider instance
 * @param pkpPublicKey - The PKP public key for transaction signing
 * @param pkpEthAddress - The ethereum address derived from PKP
 * @param amount - Amount to send in ether (will be converted to wei)
 * @param to - Optional recipient address, defaults to self if not provided
 * @returns The transaction hash
 */
export const nativeSend = async ({
  provider,
  pkpPublicKey,
  amount,
  to,
}: {
  provider: InstanceType<typeof ethers.providers.JsonRpcProvider>;
  pkpPublicKey: string;
  amount: string;
  to: string;
}) => {
  const fromAddress = toEthAddress(pkpPublicKey);
  const recipientAddress = to;

  // Get transaction parameters
  const nonce = await provider.getTransactionCount(fromAddress);
  
  const gasLimit = await provider.estimateGas({
    from: fromAddress,
    to: recipientAddress,
    value: ethers.utils.parseEther(amount),
  });
  const gasPrice = await provider.getGasPrice();
  const txAmount = ethers.utils.parseEther(amount);

  // Prepare unsigned transaction
  const unsignedTx = {
    to: recipientAddress,
    value: txAmount,
    gasLimit: gasLimit,
    gasPrice: gasPrice,
    nonce: nonce,
    chainId: (await provider.getNetwork()).chainId,
  };

  // Sign transaction
  const signedTxSignature = await signTx({
    sigName: "native-send-tx",
    pkpPublicKey: pkpPublicKey,
    tx: unsignedTx,
  });

  // Send transaction
  const txHash = await sendTx(provider, signedTxSignature);

  return txHash;
};
