import { ethers } from "ethers";
import inquirer from "inquirer";
import { env } from "../env.js";
import { createLitService } from "../utils/createLitService.js";
import {
  DELEGATION_AUTH_SIG_PATH,
  PKP_PATH,
  SESSION_SIGS_PATH,
  ensureConfigDirExists,
  writeDelegationAuthSig,
  writePKP,
  writePKPs,
  writeSessionSigs,
} from "./utils/io.js";

import { litActionCodeString } from "../dist/lit-action.js";
import { pinStringToIPFS } from "./upload.js";

// Ensure config directory exists
ensureConfigDirExists();
const wallet = new ethers.Wallet(
  env.PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider(env.RPC)
);
console.log("\n👋 Master Address:", wallet.address);
console.log("💰 Balance:", ethers.utils.formatEther(await wallet.getBalance()));
console.log("\n");

async function main() {
  const lit = await createLitService(false);

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        loop: false,
        choices: [
          {
            name: "🔥 All-in-one setup (PKP + Fund + Delegation + Session)",
            value: "allInOne",
          },
          { name: "Mint new PKP", value: "mintPKP" },
          {
            name: `Mint and Fund new PKP (${env.PREFUND_PKP_ETH_AMOUNT} ETH)`,
            value: "mintAndFundPKP",
          },
          {
            name: "Generate delegation auth signature",
            value: "generateDelegationAuthSig",
          },
          {
            name: "Generate session signatures",
            value: "generateSessionSigs",
          },
          {
            name: "List PKPs",
            value: "listPKPs",
          },
          {
            name: "Upload to IPFS",
            value: "uploadToIPFS",
          },
        ],
      },
    ]);

    switch (action) {
      case "allInOne":
        try {
          console.log("🚀 Starting all-in-one setup...\n");

          console.log("1. Minting and funding new PKP...");
          const pkp = await lit.mintPKP();
          console.log(pkp);
          writePKP(pkp);

          const tx = await wallet.sendTransaction({
            to: pkp.pkpInfo.ethAddress,
            value: ethers.utils.parseEther(env.PREFUND_PKP_ETH_AMOUNT),
          });
          await tx.wait();

          // Get and display PKP balance
          const pkpBalance = await wallet.provider.getBalance(
            pkp.pkpInfo.ethAddress
          );
          console.log("✅ PKP minted and saved to", PKP_PATH);
          console.log("✅ Funded PKP with", env.PREFUND_PKP_ETH_AMOUNT, "ETH");
          console.log(
            "💰 PKP Balance:",
            ethers.utils.formatEther(pkpBalance),
            "ETH"
          );
          console.log(
            "📝 Transaction: https://yellowstone-explorer.litprotocol.com/tx/" +
              tx.hash
          );

          console.log("\n2. Generating delegation auth signature...");
          const authSig = await lit.generateDelegationAuthSig();
          console.log(authSig);
          writeDelegationAuthSig(authSig);

          console.log("\n3. Generating session signatures...");
          const sessionSigs = await lit.generateSessionSigs();
          console.log(sessionSigs);
          writeSessionSigs(sessionSigs);

          console.log("\n🎉 All-in-one setup completed successfully!\n");
          console.log("✅ PKP minted, funded and saved to", PKP_PATH);
          console.log(
            "✅ Delegation auth signature saved to",
            DELEGATION_AUTH_SIG_PATH
          );
          console.log("✅ Session signatures saved to", SESSION_SIGS_PATH);
          process.exit(0);
        } catch (error) {
          console.error("❌ All-in-one setup failed:", error);
        }
        break;

      case "mintPKP":
        try {
          console.log("Minting new PKP...");
          const pkp = await lit.mintPKP();
          console.log(pkp);
          writePKP(pkp);
          console.log("✅ PKP minted and saved to", PKP_PATH);
        } catch (error) {
          console.error("❌ Failed to mint PKP:", error);
        }
        break;

      case "generateDelegationAuthSig":
        try {
          console.log("Generating delegation auth signature...");
          const authSig = await lit.generateDelegationAuthSig();
          console.log(authSig);
          writeDelegationAuthSig(authSig);
          console.log(
            "✅ Delegation auth signature saved to",
            DELEGATION_AUTH_SIG_PATH
          );
        } catch (error) {
          console.error(
            "❌ Failed to generate delegation auth signature:",
            error
          );
        }
        break;

      case "generateSessionSigs":
        try {
          console.log("Generating session signatures...");
          const sessionSigs = await lit.generateSessionSigs();
          console.log(sessionSigs);
          writeSessionSigs(sessionSigs);
          console.log("✅ Session signatures saved to", SESSION_SIGS_PATH);
        } catch (error) {
          console.error("❌ Failed to generate session signatures:", error);
        }
        break;

      case "listPKPs":
        console.log("Listing PKPs...");
        try {
          const pkps = await lit.listPKPs();
          console.log(pkps);
          writePKPs(pkps);
        } catch (error) {
          console.error("❌ Failed to list PKPs:", error);
        }
        break;

      case "mintAndFundPKP":
        try {
          console.log("Minting new PKP and funding it...");
          const pkp = await lit.mintPKP();
          console.log(pkp);
          writePKP(pkp);

          const tx = await wallet.sendTransaction({
            to: pkp.pkpInfo.ethAddress,
            value: ethers.utils.parseEther(env.PREFUND_PKP_ETH_AMOUNT),
          });
          await tx.wait();

          // Get and display PKP balance
          const pkpBalance = await wallet.provider.getBalance(
            pkp.pkpInfo.ethAddress
          );

          console.log("✅ PKP minted and saved to", PKP_PATH);
          console.log("✅ Funded PKP with", env.PREFUND_PKP_ETH_AMOUNT, "ETH");
          console.log(
            "💰 PKP Balance:",
            ethers.utils.formatEther(pkpBalance),
            "ETH"
          );
          console.log(
            "📝 Transaction: https://yellowstone-explorer.litprotocol.com/tx/" +
              tx.hash
          );
        } catch (error) {
          console.error("❌ Failed to mint and fund PKP:", error);
        }
        break;

      case "uploadToIPFS":
        try {
          const result = await pinStringToIPFS(litActionCodeString);

          if (result.status === 200) {
            console.log("🎉 Successfully uploaded to IPFS", result.data);
            console.log(
              `https://explorer.litprotocol.com/ipfs/${result.data?.IpfsHash}`
            );
          } else {
            console.error("Failed to upload to IPFS", result.error);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        }

        break;
    }

    console.log("\n-------------------\n");
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
