import { createLitService } from "../utils/createLitService";
import { litActionCodeString } from "../dist/lit-action";
import { readPKP } from "../scripts/utils/io";

(async () => {
  const lit = await createLitService();
  const pkp = readPKP();

  console.log("🏃‍♂️ Running EIP-7702 Authorization Example...");
  const res = await lit.executeJs({
    code: litActionCodeString,
    params: {
      pkpPublicKey: pkp.pkpInfo.publicKey,
      targetAddress: "0x1234567890123456789012345678901234567890", // Example target address
      chainId: 0, // 0 for universal deployment
    },
  });

  console.log("---------- Response ----------");
  console.log(res);

  console.log("---------- Logs ----------");
  console.log(res.logs);
})();
