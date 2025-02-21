import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PRIVATE_KEY: z.string(),
    LOG_LEVEL: z.enum(["info", "debug", "warn", "error"]).default("info"),
    LIT_NETWORK: z
      .enum(["datil-dev", "datil-test", "datil"])
      .default("datil-dev"),

    // Default values
    RPC: z.string().default("https://yellowstone-rpc.litprotocol.com/"),
    DELEGATION_EXPIRATION_DAYS: z.number().default(7),
    PREFUND_PKP_ETH_AMOUNT: z.string().default("0.02"),

    // Pinata
    PINATA_API: z.string(),
    PINATA_SECRET: z.string(),
  },

  clientPrefix: "PUBLIC_",

  client: {},

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
