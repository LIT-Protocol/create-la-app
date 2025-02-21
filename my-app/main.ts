import { createLitService } from "../utils/createLitService";
import { litActionCodeString } from "../dist/lit-action";
import { readPKP } from "../scripts/utils/io";

(async () => {
  const lit = await createLitService();

  console.log("🏃‍♂️ Running Lit Action...");
  const res = await lit.executeJs({
    code: litActionCodeString,
    params: {
      pkpPublicKey: readPKP().pkpInfo.publicKey,
    },
  });

  console.log("---------- Response ----------");
  console.log(res);

  console.log("---------- Logs ----------");
  console.log(res.logs);
})();
