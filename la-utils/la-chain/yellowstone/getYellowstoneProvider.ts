export const getYellowstoneProvider = async () => {
  return new ethers.providers.JsonRpcProvider(
    await Lit.Actions.getRpcUrl({
      chain: "yellowstone",
    })
  );
};
