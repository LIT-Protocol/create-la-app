export const getNonce = async ({
  address,
  chain,
}: {
  address: string;
  chain: string;
}) => {
  return await Lit.Actions.getLatestNonce({
    address,
    chain,
  });
};
