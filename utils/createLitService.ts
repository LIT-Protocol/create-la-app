import {
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LIT_ABILITY } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import { computeAddress } from "ethers/lib/utils";
import { env } from "../env";
import {
  readDelegationAuthSig,
  readSessionSigs
} from "../scripts/utils/io";

export async function createLitService(debug: boolean = false) {
  const provider = new ethers.providers.JsonRpcProvider(env.RPC);
  const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);

  const litNodeClient = new LitNodeClient({
    litNetwork: env.LIT_NETWORK,
    debug,
  });

  const litContracts = new LitContracts({
    signer: wallet,
    debug,
    network: env.LIT_NETWORK,
  });

  await litNodeClient.connect();
  await litContracts.connect();

  async function executeJs(params: { code: string; params: any }) {
    const sessionSigs = readSessionSigs();
    return litNodeClient.executeJs({
      code: params.code,
      sessionSigs: sessionSigs,
      jsParams: params,
    });
  }

  async function generateSessionSigs() {
    const delegationAuthSig = readDelegationAuthSig();

    const _resourceAbilityRequests = [
      {
        resource: new LitPKPResource("*"),
        ability: LIT_ABILITY.PKPSigning,
      },
      {
        resource: new LitActionResource("*"),
        ability: LIT_ABILITY.LitActionExecution,
      },
    ];

    return await litNodeClient.getSessionSigs({
      chain: "ethereum",
      resourceAbilityRequests: _resourceAbilityRequests,
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }: any) => {
        if (!expiration) throw new Error("expiration is required");
        if (!resourceAbilityRequests)
          throw new Error("resourceAbilityRequests is required");
        if (!uri) throw new Error("uri is required");

        const toSign = await createSiweMessageWithRecaps({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: wallet.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient: litNodeClient,
        });

        return await generateAuthSig({
          signer: wallet,
          toSign,
        });
      },
      capabilityAuthSigs: [delegationAuthSig],
    });
  }

  async function listPKPs() {
    // const existingPKPs = readPKPs();
    // const startIndex = existingPKPs.length || 0;

    const tokenIds =
      await litContracts.pkpNftContractUtils.read.getTokensByAddress(
        wallet.address
      );
    const pkps: { tokenId: string; publicKey: string; ethAddress: string }[] =
      [];
    // for each pkp
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      const pubKey = await litContracts.pkpNftContract.read.getPubkey(tokenId);
      const ethAddress = computeAddress(pubKey);

      pkps.push({
        tokenId,
        publicKey: pubKey,
        ethAddress,
      });
    }

    return pkps;
  }

  async function mintPKP() {
    const metadata = await litContracts.pkpNftContractUtils.write.mint();
    return {
      hash: metadata.tx.hash,
      pkpInfo: metadata.pkp,
    };
  }

  async function generateDelegationAuthSig() {
    const { capacityTokenIdStr } = await litContracts.mintCapacityCreditsNFT({
      requestsPerKilosecond: 100,
      daysUntilUTCMidnightExpiration: env.DELEGATION_EXPIRATION_DAYS,
    });

    return (
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: wallet,
        capacityTokenId: capacityTokenIdStr,
        uses: "10",
        expiration: new Date(
          Date.now() + env.DELEGATION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
    ).capacityDelegationAuthSig;
  }

  return {
    executeJs,
    listPKPs,
    mintPKP,
    generateSessionSigs,
    generateDelegationAuthSig,
  };
}
