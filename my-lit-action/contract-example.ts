export const contractExample = {
  address: "0x341E5273E2E2ea3c4aDa4101F008b1261E58510D",
  methods: {
    mintNextAndAddAuthMethods: {
      inputs: [
        {
          internalType: "uint256",
          name: "keyType",
          type: "uint256",
        },
        {
          internalType: "uint256[]",
          name: "permittedAuthMethodTypes",
          type: "uint256[]",
        },
        {
          internalType: "bytes[]",
          name: "permittedAuthMethodIds",
          type: "bytes[]",
        },
        {
          internalType: "bytes[]",
          name: "permittedAuthMethodPubkeys",
          type: "bytes[]",
        },
        {
          internalType: "uint256[][]",
          name: "permittedAuthMethodScopes",
          type: "uint256[][]",
        },
        {
          internalType: "bool",
          name: "addPkpEthAddressAsPermittedAddress",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "sendPkpToItself",
          type: "bool",
        },
      ],
      name: "mintNextAndAddAuthMethods",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
  },
};
