import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";
import { env } from "../env.js";
import { litActionCodeString } from "../dist/lit-action.js";
const PINATA_PIN_NAME = "create-la-app";

export const pinStringToIPFS = async (string: string) => {
  const pinata = new pinataSDK(env.PINATA_API, env.PINATA_SECRET);

  try {
    const buffer = Buffer.from(string, "utf8");
    const stream = Readable.from(buffer);

    // @ts-ignore
    stream.path = "string.txt";

    const result = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: PINATA_PIN_NAME },
    });
    return { status: 200, data: result };
  } catch (error) {
    console.error("Error pinning to IPFS:", error);
    return { status: 500, error: "Failed to pin to IPFS" };
  }
};

// if (import.meta.main) {
//   try {
//     const result = await pinStringToIPFS(litActionCodeString);
//     console.log("IPFS upload result:", result);

//     if (result.status === 200) {
//       console.log("Successfully uploaded to IPFS", result.data);
//     } else {
//       console.error("Failed to upload to IPFS", result.error);
//     }
//   } catch (error) {
//     console.error("Unexpected error:", error);
//   }
// }
