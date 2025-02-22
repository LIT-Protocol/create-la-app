/**
 * Broadcasts a signed transaction to the network.
 * @param {string} signedTx - The signed transaction.
 * @returns {Promise<string>} The transaction hash.
 */
export const sendTx = async (
  provider: any,
  signedTx: string
): Promise<string> => {
  console.log("Broadcasting transaction...");

  const responseText = await Lit.Actions.runOnce(
    { waitForResponse: true, name: "txnSender" },
    async () => {
      try {
        const receipt = await provider.sendTransaction(signedTx);
        console.log("Transaction sent:", receipt.hash);
        return receipt.hash;
      } catch (error) {
        console.error("Error broadcasting transaction:", error);
        return JSON.stringify(error);
      }
    }
  );

  if (responseText.includes("error")) {
    throw new Error(responseText);
  }

  const txHash = responseText;

  if (!ethers.utils.isHexString(txHash)) {
    throw new Error(`Invalid transaction hash: ${txHash}`);
  }

  return txHash;
};
