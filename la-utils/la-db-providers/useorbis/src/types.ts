import { type CeramicDocument } from "@useorbis/db-sdk";
export type KeyManagementRequest = { ownerAddress: string; metadata?: string };

export type WriteResponse = CeramicDocument;

export type UpdateResponse = CeramicDocument;

export type ReadResponse = {
  columns: Array<string>;
  rows: Record<string, any>[];
};

export type DBOperation = "write" | "update" | "read";

export type DBResponseType<T extends DBOperation> = T extends "write"
  ? WriteResponse
  : T extends "update"
  ? UpdateResponse
  : T extends "read"
  ? ReadResponse
  : never;
