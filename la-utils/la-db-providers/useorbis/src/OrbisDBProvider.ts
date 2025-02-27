import {
  type CeramicDocument,
  type IEVMProvider,
  OrbisDB,
} from "@useorbis/db-sdk";
import { OrbisEVMAuth } from "@useorbis/db-sdk/auth";
import type { KeyManagementRequest } from "./types";

export class OrbisDBProvider {
  private _CERAMIC_GATEWAY =
    "https://ceramic-orbisdb-mainnet-direct.hirenodes.io/";
  private _ORBIS_GATEWAY = "https://studio.useorbis.com";

  /**
   * Charles: will transform it into an API key soon (24 Oct, 2024)
   * 8ball:
   * - Data can be written by anyone, read by anyone, modified only by the original author.
   * - EnvIDs will be migrated to UUIDv7 at some point in the future, for convenience sake.
   */
  private _ORBIS_ENV = `did:pkh:eip155:1:0x3b5dd260598b7579a0b015a1f3bbf322adc499a1`;

  private _CONTEXT = {
    Bulkie: "kjzl6kcym7w8y924czxug1jh44yznwt8zp3bgyffhw9mklmtplj0ain6xv0z568",
  } as const;

  private _TABLE = {
    key_management:
      "kjzl6hvfrbw6ca1r1v0zm8y57yn2aawpuj4qvuyljchbgzk1xugplcbjuibr4qt",
  } as const;

  private _db: OrbisDB;
  private _privateKey: string;
  private _wallet: InstanceType<typeof ethers.Wallet>;

  constructor(privateKey: string) {
    this._privateKey = privateKey;
    this._wallet = new ethers.Wallet(this._privateKey);

    this._db = new OrbisDB({
      ceramic: {
        gateway: this._CERAMIC_GATEWAY,
      },
      nodes: [
        {
          gateway: this._ORBIS_GATEWAY,
          env: this._ORBIS_ENV,
        },
      ],
    });
  }

  async connect() {
    const auth = new OrbisEVMAuth(this._wallet as unknown as IEVMProvider);

    await this._db.connectUser({ auth, saveSession: false });

    const connected = await this._db.isUserConnected();

    if (!connected) {
      throw new Error("User not connected");
    }
  }

  async write(params: KeyManagementRequest): Promise<CeramicDocument> {
    const writeRes = await this._db
      .insert(this._TABLE.key_management)
      .value({
        owner: params.ownerAddress,
        metadata: params.metadata,
      })
      .context(this._CONTEXT.Bulkie)
      .run();

    return writeRes;
  }

  async update(
    docId: string,
    params: KeyManagementRequest
  ): Promise<CeramicDocument> {
    const prepare = this._db.update(docId).replace({
      owner: params.ownerAddress,
      metadata: params.metadata,
    });

    const res = await prepare.run();

    if (!res) {
      throw new Error("❌ Update failed");
    }

    return res;
  }

  async read(ownerAddress: string): Promise<{
    columns: Array<string>;
    rows: Record<string, any>[];
  }> {
    const prepare = this._db.select().from(this._TABLE.key_management).where({
      // controller: this._ORBIS_ENV,
      owner: ownerAddress,
    });

    const res = await prepare.run();

    return res;
  }
}
