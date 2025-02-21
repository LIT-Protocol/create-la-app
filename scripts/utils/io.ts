import fs from "fs";
import path from "path";

// Constants
export const CONFIG_DIR = path.join(__dirname, "../../_config");
export const PKP_PATH = path.join(CONFIG_DIR, "pkp.json");
export const PKPS_PATH = path.join(CONFIG_DIR, "pkp-list.json");
export const DELEGATION_AUTH_SIG_PATH = path.join(
  CONFIG_DIR,
  "delegationAuthSig.json"
);
export const SESSION_SIGS_PATH = path.join(CONFIG_DIR, "sessionSigs.json");

// Ensure config directory exists
export function ensureConfigDirExists() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function readJson(path: string): {
  success: boolean;
  data?: any;
  error?: string;
} {
  try {
    const fileContent = fs.readFileSync(path, "utf8");

    if (!fileContent || !fileContent.trim()) {
      return { success: false, error: "File is empty" };
    }

    const json = JSON.parse(fileContent);
    return { success: true, data: json };
  } catch (error) {
    return { success: false, error: "Failed to parse JSON file" };
  }
}

export function readDelegationAuthSig() {
  const res = readJson(DELEGATION_AUTH_SIG_PATH);

  if (!res.success) {
    throw new Error(
      "❌ Please generate a delegationAuthSig.json file in the _config folder"
    );
  }

  return res.data;
}

export function readSessionSigs() {
  const res = readJson(SESSION_SIGS_PATH);

  if (!res.success) {
    throw new Error(
      "❌ Please generate a sessionSigs.json file in the _config folder"
    );
  }

  return res.data;
}

export function readPKP(): {
  hash: string;
  pkpInfo: {
    tokenId: string;
    publicKey: string;
    ethAddress: string;
  };
} {
  const res = readJson(PKP_PATH);

  if (!res.success) {
    throw new Error("❌ Please generate a pkp.json file in the _config folder");
  }

  return res.data;
}

export function readPKPs() {
  const res = readJson(PKPS_PATH);

  if (!res.success) {
    return [];
  }

  return res.data;
}

// Write functions
export function writePKP(pkp: any) {
  fs.writeFileSync(PKP_PATH, JSON.stringify(pkp, null, 2));
}

export function writePKPs(pkps: any) {
  fs.writeFileSync(PKPS_PATH, JSON.stringify(pkps, null, 2));
}

export function writeDelegationAuthSig(delegationAuthSig: any) {
  fs.writeFileSync(
    DELEGATION_AUTH_SIG_PATH,
    JSON.stringify(delegationAuthSig, null, 2)
  );
}

export function writeSessionSigs(sessionSigs: any) {
  fs.writeFileSync(SESSION_SIGS_PATH, JSON.stringify(sessionSigs, null, 2));
}

export { readJson };
