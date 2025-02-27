import { OrbisDBProvider } from "./OrbisDBProvider";
import type {
  DBOperation,
  DBResponseType,
  KeyManagementRequest,
} from "./types";

export async function handleDB<T extends DBOperation>({
  privateKey,
  action,
  data,
  docId,
}: {
  privateKey: `0x${string}` | string;
  action: T;
  data: KeyManagementRequest;
  docId?: string;
}): Promise<DBResponseType<T>> {
  const db = new OrbisDBProvider(privateKey);
  await db.connect();

  try {
    if (action === "write") {
      return (await db.write(data)) as DBResponseType<T>;
    } else if (action === "update") {
      if (docId === undefined) {
        throw new Error("❌ docId is required for update action");
      }
      return (await db.update(docId, data)) as DBResponseType<T>;
    } else {
      return (await db.read(data.ownerAddress)) as DBResponseType<T>;
    }
  } catch (error) {
    console.error("❌ Error in handleDB:", error);
    throw error;
  }
}
