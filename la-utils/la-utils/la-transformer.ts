import { type Hex } from "viem";

export function hexPrefixed(str: string): Hex {
  return str.startsWith("0x") ? (str as Hex) : (`0x${str}` as Hex);
}
